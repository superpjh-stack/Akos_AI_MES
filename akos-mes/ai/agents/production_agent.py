"""
Production Agent for Akos AI MES.
LangChain + LangGraph ReAct pattern with manufacturing domain tools.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Annotated, Any, Sequence, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Tool definitions
# ---------------------------------------------------------------------------

@tool
def search_knowledge(query: str, source_type: str = "") -> str:
    """
    아코스 MES 지식 베이스에서 관련 정보를 검색합니다.
    FAT 기록, BOM 정보, 설비 매뉴얼 등을 검색할 수 있습니다.

    Args:
        query: 검색 쿼리
        source_type: 소스 타입 필터 (fat_record, bom_item, manual 등). 빈 값이면 전체 검색.
    """
    try:
        from rag.retriever import KnowledgeRetriever
        retriever = KnowledgeRetriever()
        context = retriever.get_context(
            query,
            top_k=5,
            source_type=source_type or None,
        )
        retriever.close()
        return context
    except Exception as e:
        logger.warning("search_knowledge failed: %s", e)
        return f"지식 베이스 검색 중 오류가 발생했습니다: {e}"


@tool
def get_production_stats(project_id: int) -> str:
    """
    특정 프로젝트의 생산 현황 통계를 조회합니다.
    생산 오더, 진행률, 지연 여부 등을 반환합니다.

    Args:
        project_id: 프로젝트 ID
    """
    try:
        import psycopg2
        import psycopg2.extras
        dsn = os.getenv("DATABASE_URL", "")
        conn = psycopg2.connect(dsn)
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    po.id,
                    po.order_number,
                    po.status,
                    po.planned_start,
                    po.planned_end,
                    po.actual_start,
                    po.actual_end,
                    po.progress_pct
                FROM production_orders po
                WHERE po.project_id = %s
                ORDER BY po.planned_start
                LIMIT 20
            """, (project_id,))
            rows = cur.fetchall()
        conn.close()

        if not rows:
            return f"프로젝트 {project_id}에 대한 생산 오더가 없습니다."

        lines = [f"프로젝트 {project_id} 생산 현황 ({len(rows)}건):"]
        for r in rows:
            lines.append(
                f"  - [{r['order_number']}] 상태={r['status']} "
                f"진행률={r.get('progress_pct', 0):.0f}% "
                f"계획={r['planned_start']}~{r['planned_end']}"
            )
        return "\n".join(lines)

    except Exception as e:
        logger.warning("get_production_stats failed: %s", e)
        return f"생산 현황 조회 중 오류: {e}"


@tool
def get_bom_info(project_id: int, search_term: str = "") -> str:
    """
    프로젝트의 BOM(자재명세서) 정보를 조회합니다.

    Args:
        project_id: 프로젝트 ID
        search_term: 품목명 검색어 (선택)
    """
    try:
        import psycopg2
        import psycopg2.extras
        dsn = os.getenv("DATABASE_URL", "")
        conn = psycopg2.connect(dsn)
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            if search_term:
                cur.execute("""
                    SELECT item_code, item_name, quantity, unit, unit_price, status
                    FROM bom_items
                    WHERE project_id = %s AND item_name ILIKE %s
                    ORDER BY item_code
                    LIMIT 20
                """, (project_id, f"%{search_term}%"))
            else:
                cur.execute("""
                    SELECT item_code, item_name, quantity, unit, unit_price, status
                    FROM bom_items
                    WHERE project_id = %s
                    ORDER BY item_code
                    LIMIT 20
                """, (project_id,))
            rows = cur.fetchall()
        conn.close()

        if not rows:
            return f"프로젝트 {project_id} BOM 항목이 없습니다."

        lines = [f"프로젝트 {project_id} BOM ({len(rows)}건):"]
        for r in rows:
            lines.append(
                f"  [{r['item_code']}] {r['item_name']} "
                f"수량={r['quantity']}{r['unit']} "
                f"단가={r.get('unit_price', 'N/A')} 상태={r.get('status', '-')}"
            )
        return "\n".join(lines)

    except Exception as e:
        logger.warning("get_bom_info failed: %s", e)
        return f"BOM 조회 중 오류: {e}"


@tool
def predict_defect(
    설비사양: float,
    BOM복잡도: float,
    공정이상횟수: float,
    자재품질등급: float,
    설계변경횟수: float,
) -> str:
    """
    입력된 공정 파라미터를 기반으로 불량 위험도를 예측합니다.

    Args:
        설비사양: 설비 사양 점수 (1~10)
        BOM복잡도: BOM 항목 수
        공정이상횟수: 공정 이상 발생 횟수
        자재품질등급: 자재 품질 등급 (1=최상, 5=최하)
        설계변경횟수: 설계 변경 횟수
    """
    try:
        from predictive.defect_model import DefectPredictor, generate_sample_data
        predictor = DefectPredictor()
        df = generate_sample_data(500)
        predictor.train(df)
        result = predictor.predict({
            "설비사양": 설비사양,
            "BOM복잡도": BOM복잡도,
            "공정이상횟수": 공정이상횟수,
            "자재품질등급": 자재품질등급,
            "설계변경횟수": 설계변경횟수,
        })
        causes = ", ".join(
            f"{c['feature']}({c['direction']})" for c in result["top_causes"]
        )
        return (
            f"불량 위험 스코어: {result['risk_score']}/10 "
            f"[{result['risk_level']}] "
            f"불량 확률: {result['defect_prob']*100:.1f}% "
            f"주요 원인: {causes}"
        )
    except Exception as e:
        logger.warning("predict_defect tool failed: %s", e)
        return f"불량 예측 오류: {e}"


# ---------------------------------------------------------------------------
# Agent state
# ---------------------------------------------------------------------------

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]


# ---------------------------------------------------------------------------
# ProductionAgent
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """당신은 아코스(Akos) 제조 실행 시스템(MES)의 AI 전문 어시스턴트입니다.

역할과 전문성:
- 수변전 설비, 배전반, 태양광 시스템, ESS, 공장 자동화 설비 전문 지식 보유
- FAT(공장 인수 시험) 분석 및 품질 관리
- BOM(자재명세서) 관리 및 원가 최적화
- 생산 계획 수립 및 공정 이상 대응
- 불량 예방 및 리스크 관리

도구 사용 원칙:
1. 구체적인 데이터가 필요한 경우 반드시 도구를 사용하세요.
2. 불량 위험이 의심될 때는 predict_defect 도구로 정량적 분석을 수행하세요.
3. 답변은 한국어로 작성하고, 수치 데이터와 함께 실행 가능한 권고 사항을 제시하세요.
4. 불확실한 정보는 명확히 표시하고 추가 확인이 필요한 사항을 안내하세요.

응답 형식:
- 현황 요약 → 분석 → 권고 사항 순으로 구성
- 중요 수치는 강조 표시
- 즉각적인 조치가 필요한 경우 우선순위를 명시"""


class ProductionAgent:
    """
    LangChain + LangGraph 기반 생산 관리 AI 에이전트.

    Usage
    -----
    agent = ProductionAgent()
    result = agent.run("프로젝트 42번 BOM 현황과 불량 위험도를 분석해주세요.")
    print(result["answer"])
    """

    TOOLS = [search_knowledge, get_production_stats, get_bom_info, predict_defect]

    def __init__(
        self,
        openai_api_key: str | None = None,
        model: str = "gpt-4o-mini",
        temperature: float = 0.1,
        max_iterations: int = 10,
    ) -> None:
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self._llm = ChatOpenAI(
            api_key=api_key,
            model=model,
            temperature=temperature,
        ).bind_tools(self.TOOLS)
        self._max_iterations = max_iterations
        self._graph = self._build_graph()

    # ------------------------------------------------------------------
    # LangGraph construction
    # ------------------------------------------------------------------

    def _build_graph(self) -> Any:
        tool_node = ToolNode(self.TOOLS)

        def should_continue(state: AgentState) -> str:
            last = state["messages"][-1]
            if isinstance(last, AIMessage) and last.tool_calls:
                return "tools"
            return END

        def call_model(state: AgentState) -> AgentState:
            messages = state["messages"]
            # Inject system prompt if first call
            if not any(
                getattr(m, "type", None) == "system" for m in messages
            ):
                from langchain_core.messages import SystemMessage
                messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(messages)

            response = self._llm.invoke(messages)
            return {"messages": [response]}

        graph = StateGraph(AgentState)
        graph.add_node("agent", call_model)
        graph.add_node("tools", tool_node)
        graph.set_entry_point("agent")
        graph.add_conditional_edges("agent", should_continue)
        graph.add_edge("tools", "agent")

        return graph.compile()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def run(self, query: str) -> dict:
        """
        Run the ReAct agent for the given query.

        Returns
        -------
        dict:
            answer   : str  — final LLM response
            messages : list — full message trace
            tool_calls_made : list[str] — names of tools invoked
        """
        initial_state: AgentState = {
            "messages": [HumanMessage(content=query)]
        }

        config = {"recursion_limit": self._max_iterations * 2}
        final_state = self._graph.invoke(initial_state, config=config)

        messages = final_state["messages"]
        answer = ""
        for m in reversed(messages):
            if isinstance(m, AIMessage) and not m.tool_calls:
                answer = m.content
                break

        tool_calls_made = [
            tc["name"]
            for m in messages
            if isinstance(m, AIMessage) and m.tool_calls
            for tc in m.tool_calls
        ]

        return {
            "answer": answer,
            "tool_calls_made": tool_calls_made,
            "message_count": len(messages),
        }
