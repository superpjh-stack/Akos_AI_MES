"""
FAT Agent for Akos AI MES.
Analyzes Factory Acceptance Test results, infers root causes,
generates rework instructions, and searches similar failure history.
"""
from __future__ import annotations

import logging
import os
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

FAT_SYSTEM_PROMPT = """당신은 아코스(Akos) 공장 인수 시험(FAT) 전문 분석가입니다.

전문 영역:
- 수변전 설비 절연 저항, 내전압, 동작 시험
- 배전반 차단기 특성 시험, 보호 계전기 시험
- 태양광/ESS 전기적 특성 시험
- 공장 자동화 설비 기능 시험

분석 원칙:
1. 측정값과 기준값의 편차를 정량적으로 분석하세요.
2. 불합격 원인을 1차(직접 원인) / 2차(근본 원인)로 구분하세요.
3. 재작업 지시는 구체적인 조치 항목과 재시험 기준을 포함하세요.
4. 유사 불량 사례와 비교하여 반복성 여부를 판단하세요.
5. 모든 응답은 한국어로 작성하세요."""


class FATAgent:
    """
    FAT 결과 분석 및 재작업 지시 생성 에이전트.

    Usage
    -----
    agent = FATAgent()
    analysis = agent.analyze_fat_result(fat_record)
    rework = agent.suggest_rework(fat_record)
    similar = agent.search_similar_failures("절연저항", 0.5)
    """

    def __init__(
        self,
        openai_api_key: str | None = None,
        model: str = "gpt-4o-mini",
        temperature: float = 0.1,
    ) -> None:
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self._llm = ChatOpenAI(
            api_key=api_key,
            model=model,
            temperature=temperature,
        )
        self._system = SystemMessage(content=FAT_SYSTEM_PROMPT)

    # ------------------------------------------------------------------
    # Core analysis
    # ------------------------------------------------------------------

    def analyze_fat_result(self, fat_record: dict) -> dict:
        """
        FAT 기록 단건을 분석하여 원인 추론 및 위험도 평가를 반환합니다.

        Parameters
        ----------
        fat_record : dict
            Keys: test_item, measured_value, spec_min, spec_max,
                  unit, result, notes (optional), project_id (optional)

        Returns
        -------
        dict:
            status          : 'pass' | 'fail' | 'marginal'
            deviation_pct   : float
            severity        : 'low' | 'medium' | 'high' | 'critical'
            primary_cause   : str
            root_cause      : str
            recommendation  : str
            llm_analysis    : str
        """
        test_item = fat_record.get("test_item", "알 수 없음")
        measured = fat_record.get("measured_value")
        spec_min = fat_record.get("spec_min")
        spec_max = fat_record.get("spec_max")
        unit = fat_record.get("unit", "")
        result = fat_record.get("result", "unknown")
        notes = fat_record.get("notes", "")

        # Quantitative analysis
        deviation_pct = 0.0
        status = result
        severity = "low"

        if measured is not None and spec_min is not None and spec_max is not None:
            spec_mid = (spec_min + spec_max) / 2
            spec_range = max(spec_max - spec_min, 1e-9)

            if measured < spec_min:
                deviation_pct = round((spec_min - measured) / spec_range * 100, 2)
                status = "fail"
                severity = self._severity(deviation_pct)
            elif measured > spec_max:
                deviation_pct = round((measured - spec_max) / spec_range * 100, 2)
                status = "fail"
                severity = self._severity(deviation_pct)
            elif measured < spec_min + spec_range * 0.1 or measured > spec_max - spec_range * 0.1:
                deviation_pct = round(abs(measured - spec_mid) / spec_range * 50, 2)
                status = "marginal"
                severity = "low"
            else:
                status = "pass"

        # LLM analysis
        prompt = self._build_analysis_prompt(fat_record, deviation_pct, severity)
        llm_response = self._call_llm(prompt)

        # Parse structured sections from LLM response
        primary_cause = self._extract_section(llm_response, "1차 원인")
        root_cause = self._extract_section(llm_response, "근본 원인")
        recommendation = self._extract_section(llm_response, "권고 사항")

        return {
            "test_item": test_item,
            "measured_value": measured,
            "spec_min": spec_min,
            "spec_max": spec_max,
            "unit": unit,
            "status": status,
            "deviation_pct": deviation_pct,
            "severity": severity,
            "primary_cause": primary_cause,
            "root_cause": root_cause,
            "recommendation": recommendation,
            "llm_analysis": llm_response,
        }

    def suggest_rework(self, fat_record: dict) -> dict:
        """
        불합격 FAT 항목에 대한 재작업 지시를 생성합니다.

        Returns
        -------
        dict:
            rework_instructions : list[str]
            retest_criteria     : str
            estimated_hours     : float
            priority            : str
            llm_instructions    : str
        """
        test_item = fat_record.get("test_item", "알 수 없음")
        measured = fat_record.get("measured_value")
        spec_min = fat_record.get("spec_min")
        spec_max = fat_record.get("spec_max")
        unit = fat_record.get("unit", "")

        prompt = f"""다음 FAT 불합격 항목에 대해 재작업 지시를 작성해 주세요.

시험 항목: {test_item}
측정값: {measured} {unit}
기준 하한: {spec_min} {unit}
기준 상한: {spec_max} {unit}
비고: {fat_record.get('notes', '없음')}

다음 형식으로 작성하세요:

재작업 절차:
1. [조치 항목]
2. [조치 항목]
...

재시험 기준:
[합격 기준 및 방법]

예상 소요 시간: [시간]H
우선순위: [긴급/높음/중간/낮음]
"""
        llm_response = self._call_llm(prompt)

        # Parse instructions list
        instructions = []
        in_section = False
        for line in llm_response.split("\n"):
            stripped = line.strip()
            if "재작업 절차" in stripped:
                in_section = True
                continue
            if in_section and stripped.startswith(tuple("0123456789")):
                instructions.append(stripped)
            elif in_section and stripped and not stripped[0].isdigit():
                in_section = False

        retest = self._extract_section(llm_response, "재시험 기준")

        # Estimate hours from response
        import re
        hours_match = re.search(r"(\d+(?:\.\d+)?)\s*H", llm_response)
        estimated_hours = float(hours_match.group(1)) if hours_match else 4.0

        priority_map = {"긴급": "urgent", "높음": "high", "중간": "medium", "낮음": "low"}
        priority = "medium"
        for kor, eng in priority_map.items():
            if kor in llm_response:
                priority = eng
                break

        return {
            "test_item": test_item,
            "rework_instructions": instructions or ["LLM 응답을 참조하세요."],
            "retest_criteria": retest,
            "estimated_hours": estimated_hours,
            "priority": priority,
            "llm_instructions": llm_response,
        }

    def search_similar_failures(
        self,
        test_item: str,
        measured_value: float | None = None,
        top_k: int = 5,
    ) -> list[dict]:
        """
        유사 불량 이력을 벡터 검색으로 조회합니다.

        Parameters
        ----------
        test_item : str
            시험 항목명 (예: "절연저항", "내전압")
        measured_value : float | None
            측정값 (검색 쿼리 보강에 사용)
        top_k : int

        Returns
        -------
        list[dict] — similar FAT failure records with similarity scores
        """
        query = f"FAT 불합격 {test_item}"
        if measured_value is not None:
            query += f" 측정값 {measured_value}"

        try:
            from rag.retriever import KnowledgeRetriever
            retriever = KnowledgeRetriever()
            results = retriever.search(query, top_k=top_k, source_type="fat_record")
            retriever.close()
            return results
        except Exception as e:
            logger.warning("search_similar_failures failed: %s", e)
            return []

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _call_llm(self, user_prompt: str) -> str:
        try:
            response = self._llm.invoke([
                self._system,
                HumanMessage(content=user_prompt),
            ])
            return response.content
        except Exception as e:
            logger.error("LLM call failed: %s", e)
            return f"LLM 호출 오류: {e}"

    def _build_analysis_prompt(
        self, record: dict, deviation_pct: float, severity: str
    ) -> str:
        severity_map = {
            "low": "낮음", "medium": "중간", "high": "높음", "critical": "심각"
        }
        return f"""다음 FAT 결과를 분석해 주세요.

시험 항목: {record.get('test_item', '알 수 없음')}
측정값: {record.get('measured_value')} {record.get('unit', '')}
기준 하한: {record.get('spec_min')} {record.get('unit', '')}
기준 상한: {record.get('spec_max')} {record.get('unit', '')}
시험 결과: {record.get('result', 'unknown')}
편차율: {deviation_pct:.1f}%
심각도: {severity_map.get(severity, severity)}
비고: {record.get('notes', '없음')}

다음 항목을 포함하여 분석해 주세요:
1차 원인: [직접적 불합격 원인]
근본 원인: [근본적 원인 (설계, 자재, 공정 등)]
권고 사항: [즉각적인 조치 사항]
"""

    @staticmethod
    def _severity(deviation_pct: float) -> str:
        if deviation_pct >= 50:
            return "critical"
        if deviation_pct >= 25:
            return "high"
        if deviation_pct >= 10:
            return "medium"
        return "low"

    @staticmethod
    def _extract_section(text: str, section: str) -> str:
        """Extract the content after a section header in LLM output."""
        lines = text.split("\n")
        capturing = False
        parts: list[str] = []
        for line in lines:
            if section in line:
                capturing = True
                rest = line.split(":", 1)[-1].strip()
                if rest:
                    parts.append(rest)
                continue
            if capturing:
                stripped = line.strip()
                if stripped and any(
                    kw in stripped for kw in ["원인", "권고", "기준", "절차", "우선"]
                ) and section not in stripped:
                    break
                if stripped:
                    parts.append(stripped)
        return " ".join(parts).strip() or "분석 결과를 LLM 응답에서 확인하세요."
