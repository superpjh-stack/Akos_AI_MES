from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from ..database import Base


class BomItem(Base):
    __tablename__ = "bom_items"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    part_no = Column(String(100), nullable=False)
    part_name = Column(String(255), nullable=False)
    quantity = Column(Numeric(12, 4), nullable=False, default=1)
    unit = Column(String(20), nullable=False, default="EA")
    parent_id = Column(
        Integer, ForeignKey("bom_items.id", ondelete="SET NULL"), nullable=True, index=True
    )
    revision = Column(String(20), nullable=False, default="A")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    project = relationship("Project", back_populates="bom_items")
    parent = relationship("BomItem", back_populates="children", remote_side=[id])
    children = relationship(
        "BomItem",
        back_populates="parent",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
