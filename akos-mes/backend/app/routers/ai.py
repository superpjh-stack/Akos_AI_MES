from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from ..database import get_db
from ..models.fat import FatRecord, FATResult
from ..models.project import Project
from ..config import get_settings

router = APIRouter()
settings = get_settings()

# ── Request / Response schemas (inline, AI-specific) ──────────────────────────

class CostPredictRequest(BaseModel):
    project_id: int
    bom_count: Optional[int] = None
    complexity: Optional[str] = Field(default="medium", pattern="^(low|medium|high)$")
    region: Optional[str] = None
    extra_context: Optional[str] = None


class CostPredictResponse(BaseModel):
    project_id: int
    estimated_cost: float
    currency: str = "USD"
    confidence: float
    breakdown: Dict[str, float] = {}
    model: str
    predicted_at: datetime


class LeadtimePredictRequest(BaseModel):
    project_id: int
    bom_count: Optional[int] = None
    production_stages: Optional[int] = None
    complexity: Optional[str] = Field(default="medium", pattern="^(low|medium|high)$")
    extra_context: Optional[str] = None


class LeadtimePredictResponse(BaseModel):
    project_id: int
    estimated_days: int
    estimated_delivery_date: Optional[str] = None
    confidence: float
    model: str
    predicted_at: datetime


class AgentQueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    project_id: Optional[int] = None
    context: Optional[str] = None


class AgentQueryResponse(BaseModel):
    answer: str
    sources: List[str] = []
    model: str
    tokens_used: Optional[int] = None


class PredictionRecord(BaseModel):
    id: int
    project_id: int
    prediction_type: str
    result: Dict[str, Any]
    predicted_at: datetime

    model_config = {"from_attributes": True}


# ── In-memory prediction log (replace with DB table for production) ───────────
_prediction_log: List[Dict[str, Any]] = []
_log_counter = 0


def _log_prediction(project_id: int, prediction_type: str, result: Dict[str, Any]) -> Dict[str, Any]:
    global _log_counter
    _log_counter += 1
    record = {
        "id": _log_counter,
        "project_id": project_id,
        "prediction_type": prediction_type,
        "result": result,
        "predicted_at": datetime.now(timezone.utc),
    }
    _prediction_log.append(record)
    return record


def _complexity_multiplier(complexity: str) -> float:
    return {"low": 0.75, "medium": 1.0, "high": 1.4}.get(complexity, 1.0)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/predict/cost", response_model=CostPredictResponse)
async def predict_cost(
    payload: CostPredictRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Estimate project cost using a rule-based model (or OpenAI when configured).
    """
    project = await db.get(Project, payload.project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {payload.project_id} not found")

    multiplier = _complexity_multiplier(payload.complexity or "medium")
    bom_factor = (payload.bom_count or 50) * 120.0
    base = float(project.budget or 100_000)
    estimated = round(base * multiplier + bom_factor, 2)
    confidence = max(0.5, 0.95 - (multiplier - 1.0) * 0.3)

    result = CostPredictResponse(
        project_id=payload.project_id,
        estimated_cost=estimated,
        currency="USD",
        confidence=round(confidence, 3),
        breakdown={
            "base_budget": base,
            "complexity_adjustment": round(base * (multiplier - 1.0), 2),
            "bom_cost": bom_factor,
        },
        model="rule-based-v1",
        predicted_at=datetime.now(timezone.utc),
    )
    _log_prediction(payload.project_id, "cost", result.model_dump(mode="json"))
    return result


@router.post("/predict/leadtime", response_model=LeadtimePredictResponse)
async def predict_leadtime(
    payload: LeadtimePredictRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Estimate lead time in working days using a rule-based model.
    """
    project = await db.get(Project, payload.project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {payload.project_id} not found")

    multiplier = _complexity_multiplier(payload.complexity or "medium")
    stages = payload.production_stages or 5
    bom_count = payload.bom_count or 50
    estimated_days = int(round((stages * 10 + bom_count * 0.5) * multiplier))
    confidence = max(0.5, 0.9 - (multiplier - 1.0) * 0.2)

    # Estimate delivery date from today
    from datetime import timedelta, date
    delivery_date = (date.today() + timedelta(days=estimated_days)).isoformat()

    result = LeadtimePredictResponse(
        project_id=payload.project_id,
        estimated_days=estimated_days,
        estimated_delivery_date=delivery_date,
        confidence=round(confidence, 3),
        model="rule-based-v1",
        predicted_at=datetime.now(timezone.utc),
    )
    _log_prediction(payload.project_id, "leadtime", result.model_dump(mode="json"))
    return result


@router.post("/agent/query", response_model=AgentQueryResponse)
async def agent_query(
    payload: AgentQueryRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    AI Agent query endpoint. Uses OpenAI GPT if configured, otherwise returns
    a rule-based answer derived from MES data.
    """
    # Build context from DB if project_id provided
    db_context = ""
    if payload.project_id:
        project = await db.get(Project, payload.project_id)
        if project:
            fat_result = await db.execute(
                select(FatRecord.result, )
                .where(FatRecord.project_id == payload.project_id)
            )
            fat_rows = fat_result.scalars().all()
            total_fat = len(fat_rows)
            pass_fat = sum(1 for r in fat_rows if r == FATResult.PASS)
            db_context = (
                f"Project: {project.name}, Customer: {project.customer}, "
                f"Status: {project.status.value}, "
                f"FAT records: {total_fat}, FAT pass rate: "
                f"{round(pass_fat/total_fat*100,1) if total_fat else 'N/A'}%"
            )

    if settings.openai_api_key and settings.openai_api_key not in ("", "your_key_here"):
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.openai_api_key)
            system_prompt = (
                "You are an expert AI assistant for a Manufacturing Execution System (MES). "
                "You help with production planning, FAT testing analysis, BOM management, "
                "cost estimation, and project delivery. Be concise and practical."
            )
            if db_context:
                system_prompt += f"\n\nCurrent project context: {db_context}"
            if payload.context:
                system_prompt += f"\n\nAdditional context: {payload.context}"

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": payload.question},
                ],
                max_tokens=1024,
            )
            answer = response.choices[0].message.content or ""
            tokens = response.usage.total_tokens if response.usage else None
            return AgentQueryResponse(
                answer=answer,
                sources=["openai:gpt-4o-mini"],
                model="gpt-4o-mini",
                tokens_used=tokens,
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"OpenAI error: {exc}")

    # Fallback: rule-based response
    answer = (
        f"[Rule-based AI] Your question: '{payload.question}'. "
    )
    if db_context:
        answer += f"Project context — {db_context}. "
    answer += (
        "To enable AI-powered answers, set OPENAI_API_KEY in your .env file."
    )
    return AgentQueryResponse(
        answer=answer,
        sources=["rule-based-v1"],
        model="rule-based-v1",
        tokens_used=None,
    )


@router.get("/predictions/{project_id}")
async def get_predictions(
    project_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get prediction history for a project."""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    records = [r for r in _prediction_log if r["project_id"] == project_id]
    return {
        "project_id": project_id,
        "count": len(records),
        "predictions": records,
    }


# ═══ AI 솔루션 엔드포인트 추가 ════════════════════════════════

import math as _math
from datetime import date as _date, timedelta as _td


def _oee_series():
    return [{"hour": f"{h:02d}:00", "oee": round(85 + _math.sin(h/4)*5, 1), "target": 90} for h in range(24)]

def _defect_trend(days: int):
    return [{"date": (_date.today() - _td(days=days-i)).strftime("%m/%d"), "actual": round(2.1 + _math.sin(i/5)*0.6, 2), "predicted": round(2.0 + _math.cos(i/5)*0.5, 2)} for i in range(days)]


# 1. 생산 최적화
@router.get("/production-optimization/dashboard", tags=["AI Solutions"])
async def ai_production_optimization_dashboard():
    return {
        "oee": 87.3, "oee_target": 90.0, "savings_hours": 2.4,
        "bottleneck_count": 3, "implementation_rate": 72.0,
        "hourly_data": _oee_series(),
        "process_rates": [
            {"process": "조립1라인", "rate": 94}, {"process": "용접2공정", "rate": 71},
            {"process": "도장공정", "rate": 88}, {"process": "검사라인", "rate": 96},
            {"process": "포장공정", "rate": 82}, {"process": "출하라인", "rate": 79},
        ],
        "recommendations": [
            {"priority": 1, "process": "용접2공정", "issue": "설비 과부하", "improvement": "+15% 효율", "confidence": 94, "status": "대기"},
            {"priority": 2, "process": "출하라인", "issue": "인력 배치 비최적", "improvement": "+8% 효율", "confidence": 87, "status": "검토중"},
            {"priority": 3, "process": "포장공정", "issue": "사이클타임 초과", "improvement": "+6% 효율", "confidence": 91, "status": "이행중"},
            {"priority": 4, "process": "도장공정", "issue": "온도 편차", "improvement": "+4% 효율", "confidence": 82, "status": "완료"},
            {"priority": 5, "process": "조립1라인", "issue": "자재 공급 지연", "improvement": "+3% 효율", "confidence": 78, "status": "대기"},
        ],
    }

@router.post("/production-optimization/analyze", tags=["AI Solutions"])
async def ai_production_optimization_analyze(payload: dict = None):
    return {"analysis": "용접 공정에서 0.8초 사이클타임 초과 감지. 설비 A-7 그리퍼 압력 2.1→2.4bar 조정 권장.", "confidence": 0.92, "estimated_improvement": "OEE +3.2%", "actions": [{"step": 1, "action": "그리퍼 압력 조정", "duration": "15분"}, {"step": 2, "action": "사이클타임 재측정", "duration": "30분"}]}


# 2. 품질 예측
@router.get("/quality-prediction/dashboard", tags=["AI Solutions"])
async def ai_quality_prediction_dashboard():
    return {
        "accuracy": 94.2, "today_predicted_defect": 1.8, "defect_threshold": 3.0,
        "risk_processes": 2, "weekly_alerts": 5,
        "trend_data": _defect_trend(30),
        "factor_impacts": [
            {"factor": "온도편차", "impact": 42}, {"factor": "재료로트", "impact": 35},
            {"factor": "압력변동", "impact": 31}, {"factor": "이송속도", "impact": 28}, {"factor": "습도", "impact": 15},
        ],
        "forecasts": [
            {"time": "14:00", "line": "조립1라인", "predicted_defect": 2.1, "confidence": 89, "main_cause": "온도편차", "action": "냉각수 유량 점검"},
            {"time": "16:00", "line": "용접2공정", "predicted_defect": 3.8, "confidence": 93, "main_cause": "전극 마모", "action": "전극 교체 필요"},
            {"time": "18:00", "line": "도장공정", "predicted_defect": 1.2, "confidence": 76, "main_cause": "습도 상승", "action": "제습기 가동"},
        ],
    }


# 3. 설비 예지보전
@router.get("/predictive-maintenance/dashboard", tags=["AI Solutions"])
async def ai_predictive_maintenance_dashboard():
    return {
        "prediction_accuracy": 91.5, "urgent_count": 2,
        "monthly_savings": 12400000, "avg_rul": 576,
        "equipments": [
            {"id": "CNC-001", "name": "CNC 머시닝센터 #1", "health": 92, "rul": 1240, "status": "정상", "next_maintenance": "2026-07-15"},
            {"id": "WLD-002", "name": "용접로봇 #2", "health": 61, "rul": 312, "status": "주의", "next_maintenance": "2026-06-18"},
            {"id": "CNV-003", "name": "컨베이어 #3", "health": 45, "rul": 180, "status": "위험", "next_maintenance": "2026-06-10"},
            {"id": "PRS-004", "name": "유압프레스 #4", "health": 88, "rul": 980, "status": "정상", "next_maintenance": "2026-08-01"},
            {"id": "INS-005", "name": "비전검사기 #5", "health": 77, "rul": 650, "status": "양호", "next_maintenance": "2026-07-05"},
            {"id": "ROB-006", "name": "협동로봇 #6", "health": 35, "rul": 95, "status": "긴급", "next_maintenance": "즉시"},
        ],
        "sensor_trend": [
            {"date": (_date.today() - _td(days=29-i)).strftime("%m/%d"), "vibration": round(0.8 + i*0.03, 2), "temperature": round(72 + i*0.2, 1), "current": round(14.2 + i*0.05, 2)}
            for i in range(30)
        ],
    }


# 4. 에너지 관리
@router.get("/energy-management/dashboard", tags=["AI Solutions"])
async def ai_energy_management_dashboard():
    return {
        "monthly_savings_pct": 8.3, "predicted_cost": 24700000, "co2_reduction": 15.2, "waste_zones": 4,
        "hourly_data": [{"hour": f"{h:02d}:00", "consumption": round(180 + 40*_math.sin((h-6)/_math.pi*1.5), 1), "baseline": 185} for h in range(24)],
        "breakdown": [
            {"name": "CNC 설비군", "value": 38, "color": "#2563eb"}, {"name": "용접 설비", "value": 24, "color": "#7c3aed"},
            {"name": "공조/냉각", "value": 18, "color": "#0891b2"}, {"name": "조명/기타", "value": 12, "color": "#16a34a"},
            {"name": "컨베이어", "value": 8, "color": "#d97706"},
        ],
        "recommendations": [
            {"target": "CNC-001~003", "current": "142 kWh", "saving": "11.8 kWh", "cost_saving": "₩1,416/일", "action": "대기모드 스케줄 최적화", "priority": "높음"},
            {"target": "공조시스템", "current": "64 kWh", "saving": "8.3 kWh", "cost_saving": "₩996/일", "action": "피크타임 온도 설정 조정", "priority": "높음"},
            {"target": "조명시스템", "current": "22 kWh", "saving": "6.2 kWh", "cost_saving": "₩744/일", "action": "재실 감지 센서 확대", "priority": "중간"},
            {"target": "유압 설비", "current": "38 kWh", "saving": "4.1 kWh", "cost_saving": "₩492/일", "action": "유압 압력 최적화", "priority": "낮음"},
        ],
    }


# 5. 불량 분석
@router.get("/defect-analysis/dashboard", tags=["AI Solutions"])
async def ai_defect_analysis_dashboard():
    return {
        "defect_rate": 2.3, "defect_target": 2.0, "ai_accuracy": 96.1,
        "auto_resolved_pct": 67.0, "monthly_savings": 8200000,
        "defect_types": [
            {"name": "치수불량", "value": 35, "color": "#ef4444"}, {"name": "표면불량", "value": 28, "color": "#f97316"},
            {"name": "용접불량", "value": 18, "color": "#eab308"}, {"name": "조립불량", "value": 12, "color": "#8b5cf6"},
            {"name": "기타", "value": 7, "color": "#6b7280"},
        ],
        "weekly_trend": [{"week": f"{8-i}주전", "치수불량": 10+i, "표면불량": 7+i//2, "용접불량": 4+i//3} for i in range(8)],
        "recent_defects": [
            {"datetime": "2026-06-04 09:12", "line": "조립1라인", "type": "치수불량", "ai_cause": "공구 마모 84%", "confidence": 96, "action": "공구 교체", "status": "완료"},
            {"datetime": "2026-06-04 10:34", "line": "용접2공정", "type": "용접불량", "ai_cause": "전극 오염 감지", "confidence": 91, "action": "전극 세척", "status": "처리중"},
            {"datetime": "2026-06-04 11:05", "line": "도장공정", "type": "표면불량", "ai_cause": "도료 점도 이상", "confidence": 88, "action": "도료 교체", "status": "대기"},
            {"datetime": "2026-06-04 13:22", "line": "검사라인", "type": "치수불량", "ai_cause": "지그 위치 틀어짐", "confidence": 94, "action": "지그 재조정", "status": "완료"},
            {"datetime": "2026-06-04 14:47", "line": "포장공정", "type": "기타", "ai_cause": "포장재 불량", "confidence": 77, "action": "포장재 교체", "status": "대기"},
        ],
    }


# 6. 수요 예측
@router.get("/demand-forecasting/dashboard", tags=["AI Solutions"])
async def ai_demand_forecasting_dashboard():
    return {
        "mape": 4.2, "next_month_demand": 1247, "inventory_reduction": 18.4, "delivery_rate": 97.3,
        "monthly_trend": [
            {"month": "2026/01", "actual": 1082, "predicted": 1095, "is_future": False},
            {"month": "2026/02", "actual": 987, "predicted": 1010, "is_future": False},
            {"month": "2026/03", "actual": 1145, "predicted": 1120, "is_future": False},
            {"month": "2026/04", "actual": 1203, "predicted": 1180, "is_future": False},
            {"month": "2026/05", "actual": 1267, "predicted": 1240, "is_future": False},
            {"month": "2026/06", "actual": None, "predicted": 1247, "is_future": True},
            {"month": "2026/07", "actual": None, "predicted": 1312, "is_future": True},
            {"month": "2026/08", "actual": None, "predicted": 1289, "is_future": True},
        ],
        "product_forecasts": [
            {"product": "자동화 용접라인", "next_month": 312, "range": "290~335", "stock": 45, "need_produce": 267, "order_date": "2026-06-20"},
            {"product": "PLC 제어반", "next_month": 248, "range": "230~265", "stock": 82, "need_produce": 166, "order_date": "2026-06-25"},
            {"product": "컨베이어 시스템", "next_month": 187, "range": "170~205", "stock": 23, "need_produce": 164, "order_date": "2026-06-10"},
            {"product": "비전검사장비", "next_month": 156, "range": "140~172", "stock": 67, "need_produce": 89, "order_date": "2026-07-01"},
            {"product": "협동로봇 유닛", "next_month": 344, "range": "320~368", "stock": 12, "need_produce": 332, "order_date": "2026-06-08"},
        ],
    }
