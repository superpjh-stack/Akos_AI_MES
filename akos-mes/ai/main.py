"""
Akos AI MES — AI Service FastAPI application.
Exposes endpoints for cost/defect prediction, agent queries, FAT analysis, and knowledge embedding.
"""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy-loaded singletons (initialized on first request or at startup)
# ---------------------------------------------------------------------------

_defect_predictor: Any = None
_cost_predictor: Any = None
_embedding_manager: Any = None


def get_defect_predictor():
    global _defect_predictor
    if _defect_predictor is None:
        from predictive.defect_model import DefectPredictor, generate_sample_data
        predictor = DefectPredictor()
        df = generate_sample_data(1000)
        predictor.train(df)
        _defect_predictor = predictor
        logger.info("DefectPredictor initialized.")
    return _defect_predictor


def get_cost_predictor():
    global _cost_predictor
    if _cost_predictor is None:
        from predictive.cost_model import CostPredictor, generate_cost_sample_data
        predictor = CostPredictor()
        df = generate_cost_sample_data(800)
        predictor.train(df)
        _cost_predictor = predictor
        logger.info("CostPredictor initialized.")
    return _cost_predictor


def get_embedding_manager():
    global _embedding_manager
    if _embedding_manager is None:
        from rag.embeddings import EmbeddingManager
        _embedding_manager = EmbeddingManager()
        logger.info("EmbeddingManager initialized.")
    return _embedding_manager


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-warm ML models at startup."""
    logger.info("Pre-warming ML models...")
    try:
        get_defect_predictor()
        get_cost_predictor()
        logger.info("ML models ready.")
    except Exception as e:
        logger.warning("Model pre-warming failed (will retry on first request): %s", e)
    yield
    logger.info("AI service shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Akos AI MES — AI Service",
    version="1.0.0",
    description="Predictive analytics, RAG, and AI agent APIs for Akos MES",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class CostRequest(BaseModel):
    프로젝트유형: str = Field(..., example="수변전")
    설비수량: float = Field(..., ge=1, example=5)
    BOM항목수: float = Field(..., ge=1, example=150)
    납품거리: float = Field(..., ge=0, example=80.0)
    고객등급: float = Field(..., ge=1, le=3, example=2)


class LeadtimeRequest(BaseModel):
    프로젝트유형: str = Field(..., example="배전반")
    설비수량: float = Field(..., ge=1, example=3)
    BOM항목수: float = Field(..., ge=1, example=80)
    납품거리: float = Field(..., ge=0, example=200.0)
    고객등급: float = Field(..., ge=1, le=3, example=1)


class DefectRequest(BaseModel):
    설비사양: float = Field(..., ge=0, le=10, example=7.5)
    BOM복잡도: float = Field(..., ge=0, example=150)
    공정이상횟수: float = Field(..., ge=0, example=3)
    자재품질등급: float = Field(..., ge=1, le=5, example=2)
    설계변경횟수: float = Field(..., ge=0, example=2)


class AgentQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, example="프로젝트 42번의 FAT 불량 원인을 분석해주세요.")
    session_id: str | None = Field(None, example="user-123")


class FATAnalyzeRequest(BaseModel):
    test_item: str = Field(..., example="절연저항")
    measured_value: float | None = Field(None, example=0.8)
    spec_min: float | None = Field(None, example=1.0)
    spec_max: float | None = Field(None, example=100.0)
    unit: str = Field("", example="MΩ")
    result: str = Field("unknown", example="fail")
    notes: str = Field("", example="측정값 기준 미달")
    project_id: int | None = Field(None, example=42)
    action: str = Field(
        "analyze",
        description="'analyze' | 'rework' | 'similar'",
        example="analyze",
    )
    search_top_k: int = Field(5, ge=1, le=20)


class KnowledgeEmbedRequest(BaseModel):
    source_type: str = Field(..., example="fat_record")
    source_id: int | None = Field(None, example=101)
    content: str = Field(..., min_length=1, example="절연저항 시험 불합격: 측정값 0.5MΩ, 기준 1MΩ 이상")
    metadata: dict | None = Field(None, example={"project_id": 42})


class KnowledgeBatchEmbedRequest(BaseModel):
    documents: list[KnowledgeEmbedRequest] = Field(..., min_length=1)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "akos-ai-mes"}


# ---------------------------------------------------------------------------
# POST /predict/cost
# ---------------------------------------------------------------------------

@app.post("/predict/cost", tags=["Prediction"])
def predict_cost(req: CostRequest) -> dict:
    """
    프로젝트 원가를 예측합니다.
    LightGBM 기반 분위수 회귀 모델로 예측 원가 및 80% 신뢰 구간을 반환합니다.
    """
    try:
        predictor = get_cost_predictor()
        result = predictor.predict(req.model_dump())
        return {"success": True, "data": result}
    except Exception as e:
        logger.exception("predict_cost error")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /predict/leadtime
# ---------------------------------------------------------------------------

@app.post("/predict/leadtime", tags=["Prediction"])
def predict_leadtime(req: LeadtimeRequest) -> dict:
    """
    프로젝트 납기 일수를 예측합니다.
    원가 예측값을 추가 피처로 활용하여 납기를 예측합니다.
    """
    try:
        predictor = get_cost_predictor()
        result = predictor.predict_leadtime(req.model_dump())
        return {"success": True, "data": result}
    except Exception as e:
        logger.exception("predict_leadtime error")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /predict/defect
# ---------------------------------------------------------------------------

@app.post("/predict/defect", tags=["Prediction"])
def predict_defect(req: DefectRequest) -> dict:
    """
    공정 파라미터 기반 불량 위험도를 예측합니다.
    XGBoost + RandomForest 앙상블, SHAP 기반 주요 원인 Top-3 반환.
    """
    try:
        predictor = get_defect_predictor()
        result = predictor.predict(req.model_dump())
        return {"success": True, "data": result}
    except Exception as e:
        logger.exception("predict_defect error")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /agent/query
# ---------------------------------------------------------------------------

@app.post("/agent/query", tags=["Agent"])
def agent_query(req: AgentQueryRequest) -> dict:
    """
    생산 관리 AI 에이전트에 자연어 질의를 합니다.
    LangGraph ReAct 패턴으로 도구를 활용하여 답변을 생성합니다.
    """
    try:
        from agents.production_agent import ProductionAgent
        agent = ProductionAgent()
        result = agent.run(req.query)
        return {"success": True, "data": result}
    except Exception as e:
        logger.exception("agent_query error")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /fat/analyze
# ---------------------------------------------------------------------------

@app.post("/fat/analyze", tags=["FAT"])
def fat_analyze(req: FATAnalyzeRequest) -> dict:
    """
    FAT 결과를 분석합니다.

    action:
    - 'analyze'  : FAT 결과 분석 + 원인 추론
    - 'rework'   : 재작업 지시 생성
    - 'similar'  : 유사 불량 이력 검색
    """
    try:
        from agents.fat_agent import FATAgent
        agent = FATAgent()
        fat_record = req.model_dump(exclude={"action", "search_top_k"})

        if req.action == "analyze":
            result = agent.analyze_fat_result(fat_record)
        elif req.action == "rework":
            result = agent.suggest_rework(fat_record)
        elif req.action == "similar":
            result = agent.search_similar_failures(
                test_item=req.test_item,
                measured_value=req.measured_value,
                top_k=req.search_top_k,
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown action '{req.action}'. Use 'analyze', 'rework', or 'similar'.",
            )

        return {"success": True, "action": req.action, "data": result}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("fat_analyze error")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /knowledge/embed
# ---------------------------------------------------------------------------

@app.post("/knowledge/embed", tags=["Knowledge"])
def knowledge_embed(req: KnowledgeEmbedRequest) -> dict:
    """
    텍스트를 임베딩하여 pgvector 지식 베이스에 저장합니다.
    """
    try:
        manager = get_embedding_manager()
        row_id = manager.store_knowledge(
            source_type=req.source_type,
            source_id=req.source_id,
            content=req.content,
            metadata=req.metadata,
        )
        return {"success": True, "data": {"id": row_id, "source_type": req.source_type}}
    except Exception as e:
        logger.exception("knowledge_embed error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/knowledge/embed/batch", tags=["Knowledge"])
def knowledge_embed_batch(req: KnowledgeBatchEmbedRequest) -> dict:
    """
    문서 배치를 임베딩하여 pgvector 지식 베이스에 저장합니다.
    """
    try:
        manager = get_embedding_manager()
        docs = [d.model_dump() for d in req.documents]
        ids = manager.embed_batch(docs)
        return {"success": True, "data": {"inserted_ids": ids, "count": len(ids)}}
    except Exception as e:
        logger.exception("knowledge_embed_batch error")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("AI_SERVICE_PORT", "8502")),
        reload=os.getenv("DEV_MODE", "false").lower() == "true",
        log_level="info",
    )
