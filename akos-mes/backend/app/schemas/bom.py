from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional, List


class BOMItemCreate(BaseModel):
    part_no: str = Field(..., min_length=1, max_length=100)
    part_name: str = Field(..., min_length=1, max_length=255)
    quantity: Decimal = Field(default=Decimal("1"), gt=0)
    unit: str = Field(default="EA", max_length=20)
    parent_id: Optional[int] = None
    revision: str = Field(default="A", max_length=20)


class BOMItemUpdate(BaseModel):
    part_no: Optional[str] = Field(default=None, min_length=1, max_length=100)
    part_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    quantity: Optional[Decimal] = Field(default=None, gt=0)
    unit: Optional[str] = Field(default=None, max_length=20)
    parent_id: Optional[int] = None
    revision: Optional[str] = Field(default=None, max_length=20)


class BOMItemResponse(BaseModel):
    id: int
    project_id: int
    part_no: str
    part_name: str
    quantity: Decimal
    unit: str
    parent_id: Optional[int] = None
    revision: str
    created_at: datetime
    updated_at: datetime
    children: List[BOMItemResponse] = []

    model_config = {"from_attributes": True}


# Required for self-referential model rebuild
BOMItemResponse.model_rebuild()
