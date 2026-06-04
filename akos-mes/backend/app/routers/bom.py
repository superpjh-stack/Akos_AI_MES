from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models.bom import BomItem
from ..models.project import Project
from ..schemas.bom import BOMItemCreate, BOMItemUpdate, BOMItemResponse

router = APIRouter()


def _build_tree(items: List[BomItem]) -> List[BOMItemResponse]:
    """Convert a flat list of BOM items into a nested tree structure."""
    item_map: dict[int, BOMItemResponse] = {}
    roots: List[BOMItemResponse] = []

    # First pass: build response objects
    for item in items:
        resp = BOMItemResponse.model_validate(item)
        resp.children = []
        item_map[item.id] = resp

    # Second pass: assign children
    for item in items:
        resp = item_map[item.id]
        if item.parent_id is not None and item.parent_id in item_map:
            item_map[item.parent_id].children.append(resp)
        else:
            roots.append(resp)

    return roots


@router.get("/projects/{project_id}/bom", response_model=List[BOMItemResponse])
async def get_project_bom(
    project_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get BOM tree structure for a project."""
    # Verify project exists
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    result = await db.execute(
        select(BomItem)
        .where(BomItem.project_id == project_id)
        .order_by(BomItem.id)
    )
    items = result.scalars().all()
    return _build_tree(items)


@router.post(
    "/projects/{project_id}/bom",
    response_model=BOMItemResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_bom_item(
    project_id: int,
    payload: BOMItemCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add a BOM item to a project."""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    # Validate parent_id belongs to same project
    if payload.parent_id is not None:
        parent = await db.get(BomItem, payload.parent_id)
        if not parent or parent.project_id != project_id:
            raise HTTPException(
                status_code=400, detail="parent_id does not belong to this project"
            )

    item = BomItem(project_id=project_id, **payload.model_dump())
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


@router.put("/bom/{item_id}", response_model=BOMItemResponse)
async def update_bom_item(
    item_id: int,
    payload: BOMItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a BOM item."""
    item = await db.get(BomItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"BOM item {item_id} not found")

    # Validate parent_id if provided
    if payload.parent_id is not None:
        if payload.parent_id == item_id:
            raise HTTPException(status_code=400, detail="Item cannot be its own parent")
        parent = await db.get(BomItem, payload.parent_id)
        if not parent or parent.project_id != item.project_id:
            raise HTTPException(
                status_code=400, detail="parent_id does not belong to the same project"
            )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.flush()
    await db.refresh(item)
    return item


@router.delete("/bom/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bom_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a BOM item (children will have their parent_id set to NULL)."""
    item = await db.get(BomItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"BOM item {item_id} not found")
    await db.delete(item)
