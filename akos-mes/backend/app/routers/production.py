from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from ..database import get_db
from ..models.production import ProductionOrder
from ..models.project import Project

router = APIRouter()


class ProductionOrderCreate(BaseModel):
    project_id: int
    process_name: str
    status: str = "planned"
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    operator_id: Optional[int] = None


class ProductionOrderResponse(BaseModel):
    id: int
    project_id: int
    process_name: str
    status: str
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    operator_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductionStatusUpdate(BaseModel):
    status: str
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None


@router.get("/{project_id}", response_model=List[ProductionOrderResponse])
async def list_production_orders(
    project_id: int,
    db: AsyncSession = Depends(get_db),
):
    """List all production orders for a project."""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    result = await db.execute(
        select(ProductionOrder)
        .where(ProductionOrder.project_id == project_id)
        .order_by(ProductionOrder.planned_start)
    )
    return result.scalars().all()


@router.post("/", response_model=ProductionOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_production_order(
    payload: ProductionOrderCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a production order."""
    project = await db.get(Project, payload.project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {payload.project_id} not found")

    order = ProductionOrder(**payload.model_dump())
    db.add(order)
    await db.flush()
    await db.refresh(order)
    return order


@router.patch("/{order_id}/status", response_model=ProductionOrderResponse)
async def update_order_status(
    order_id: int,
    body: ProductionStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update the status of a production order."""
    order = await db.get(ProductionOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Production order {order_id} not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(order, field, value)
    await db.flush()
    await db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_production_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a production order."""
    order = await db.get(ProductionOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Production order {order_id} not found")
    await db.delete(order)
