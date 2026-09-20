from datetime import datetime
from extensions import db


class HealthPlan(db.Model):
    __tablename__ = "health_plans"

    id = db.Column(db.Integer, primary_key=True)

    member_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    practitioner_id = db.Column(
        db.Integer,
        db.ForeignKey("practitioners.id"),
        nullable=False
    )

    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text)

    status = db.Column(
        db.String(50),
        nullable=False,
        default="DRAFT"
    )

    version = db.Column(db.Integer, default=1)

    start_date = db.Column(db.Date)
    review_date = db.Column(db.Date)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    approved_at = db.Column(db.DateTime)

    member = db.relationship(
        "User",
        back_populates="health_plans"
    )

    practitioner = db.relationship(
        "Practitioner",
        back_populates="plans"
    )

    items = db.relationship(
        "PlanItem",
        back_populates="health_plan",
        cascade="all, delete-orphan",
        order_by="PlanItem.sort_order"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "member_id": self.member_id,
            "practitioner_id": self.practitioner_id,
            "title": self.title,
            "summary": self.summary,
            "status": self.status,
            "version": self.version,
            "start_date": (
                self.start_date.isoformat()
                if self.start_date else None
            ),
            "review_date": (
                self.review_date.isoformat()
                if self.review_date else None
            ),
            "approved_at": (
                self.approved_at.isoformat()
                if self.approved_at else None
            ),
            "practitioner": (
                self.practitioner.to_dict()
                if self.practitioner else None
            ),
            "items": [
                item.to_dict()
                for item in self.items
            ],
        }