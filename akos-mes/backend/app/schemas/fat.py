from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from ..models.fat import FATResult


class FATRecordCreate(BaseModel):
    test_item: str = Field(..., min_length=1, max_length=255)
    result: FATResult = FATResult.PENDING
    measured_value: Optional[Decimal] = None
    spec_min: Optional[Decimal] = None
    spec_max: Optional[Decimal] = None
    plc_log_json: Optional[str] = None


class FATRecordUpdate(BaseModel):
    test_item: Optional[str] = Field(default=None, min_length=1, max_length=255)
    result: Optional[FATResult] = None
    measured_value: Optional[Decimal] = None
    spec_min: Optional[Decimal] = None
    spec_max: Optional[Decimal] = None
    plc_log_json: Optional[str] = None


class FATRecordResponse(BaseModel):
    id: int
    project_id: int
    test_item: str
    result: FATResult
    measured_value: Optional[Decimal] = None
    spec_min: Optional[Decimal] = None
    spec_max: Optional[Decimal] = None
    plc_log_json: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FATStatsResponse(BaseModel):
    project_id: int
    total: int
    passed: int
    failed: int
    pending: int
    pass_rate: float
    fail_rate: float
    by_test_item: Dict[str, Any] = {}
