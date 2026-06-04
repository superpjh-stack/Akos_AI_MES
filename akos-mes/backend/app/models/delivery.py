from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from ..database import Base


class DeliveryRecord(Base):
    __tablename__ = "delivery_records"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    delivery_date = Column(Date, nullable=False)
    site_location = Column(String(255), nullable=True)
    sat_status = Column(String(50), nullable=False, default="pending")
    notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
