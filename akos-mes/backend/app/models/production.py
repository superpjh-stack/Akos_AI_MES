from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from ..database import Base


class ProductionOrder(Base):
    __tablename__ = "production_orders"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    process_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="planned")
    planned_start = Column(TIMESTAMP(timezone=True), nullable=True)
    planned_end = Column(TIMESTAMP(timezone=True), nullable=True)
    actual_start = Column(TIMESTAMP(timezone=True), nullable=True)
    actual_end = Column(TIMESTAMP(timezone=True), nullable=True)
    operator_id = Column(Integer, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
