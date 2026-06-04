import enum
from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey, TIMESTAMP, Enum as SAEnum, func
from sqlalchemy.orm import relationship
from ..database import Base


class FATResult(str, enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    PENDING = "PENDING"


class FatRecord(Base):
    __tablename__ = "fat_records"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    test_item = Column(String(255), nullable=False)
    result = Column(
        SAEnum(FATResult, name="fatresult", create_type=True),
        nullable=False,
        default=FATResult.PENDING,
    )
    measured_value = Column(Numeric(18, 6), nullable=True)
    spec_min = Column(Numeric(18, 6), nullable=True)
    spec_max = Column(Numeric(18, 6), nullable=True)
    plc_log_json = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    project = relationship("Project", back_populates="fat_records")
