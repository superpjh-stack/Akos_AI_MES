import enum
from sqlalchemy import Column, Integer, String, Numeric, Date, TIMESTAMP, Enum as SAEnum, func
from sqlalchemy.orm import relationship
from ..database import Base


class ProjectStatus(str, enum.Enum):
    PLANNING = "PLANNING"
    IN_PRODUCTION = "IN_PRODUCTION"
    FAT = "FAT"
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    customer = Column(String(255), nullable=False)
    status = Column(
        SAEnum(ProjectStatus, name="projectstatus", create_type=True),
        nullable=False,
        default=ProjectStatus.PLANNING,
    )
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    budget = Column(Numeric(18, 2), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    bom_items = relationship("BomItem", back_populates="project", cascade="all, delete-orphan")
    fat_records = relationship("FatRecord", back_populates="project", cascade="all, delete-orphan")
