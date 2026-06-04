from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from ..database import get_db
from ..models.fat import FatRecord, FATResult
from ..models.project import Project
from ..schemas.fat import FATRecordCreate, FATRecordUpdate, FATRecordResponse, FATStatsResponse

router = APIRouter()


@router.get("/projects/{project_id}/fat", response_model=List[FATRecordResponse])
async def list_fat_records(
    project_id: int,
    result_filter: Optional[FATResult] = Query(default=None, alias="result"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """List FAT records for a project."""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    stmt = (
        select(FatRecord)
        .where(FatRecord.project_id == project_id)
        .order_by(FatRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    if result_filter is not None:
        stmt = stmt.where(FatRecord.result == result_filter)

    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/projects/{project_id}/fat",
    response_model=FATRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_fat_record(
    project_id: int,
    payload: FATRecordCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a FAT record for a project."""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    record = FatRecord(project_id=project_id, **payload.model_dump())
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


@router.put("/fat/{record_id}", response_model=FATRecordResponse)
async def update_fat_record(
    record_id: int,
    payload: FATRecordUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a FAT record."""
    record = await db.get(FatRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"FAT record {record_id} not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    await db.flush()
    await db.refresh(record)
    return record


@router.get("/fat/stats/{project_id}", response_model=FATStatsResponse)
async def get_fat_stats(
    project_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get FAT pass rate and defect statistics for a project."""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    # Aggregate counts by result
    agg_result = await db.execute(
        select(FatRecord.result, func.count(FatRecord.id).label("cnt"))
        .where(FatRecord.project_id == project_id)
        .group_by(FatRecord.result)
    )
    counts = {row.result: row.cnt for row in agg_result.all()}

    passed = counts.get(FATResult.PASS, 0)
    failed = counts.get(FATResult.FAIL, 0)
    pending = counts.get(FATResult.PENDING, 0)
    total = passed + failed + pending

    # Per-test-item breakdown
    item_result = await db.execute(
        select(
            FatRecord.test_item,
            FatRecord.result,
            func.count(FatRecord.id).label("cnt"),
        )
        .where(FatRecord.project_id == project_id)
        .group_by(FatRecord.test_item, FatRecord.result)
        .order_by(FatRecord.test_item)
    )
    by_test_item: dict = {}
    for row in item_result.all():
        if row.test_item not in by_test_item:
            by_test_item[row.test_item] = {"PASS": 0, "FAIL": 0, "PENDING": 0}
        by_test_item[row.test_item][row.result.value if hasattr(row.result, "value") else row.result] = row.cnt

    return FATStatsResponse(
        project_id=project_id,
        total=total,
        passed=passed,
        failed=failed,
        pending=pending,
        pass_rate=round(passed / total, 4) if total > 0 else 0.0,
        fail_rate=round(failed / total, 4) if total > 0 else 0.0,
        by_test_item=by_test_item,
    )
