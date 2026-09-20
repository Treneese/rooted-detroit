from datetime import datetime
from extensions import db


class PlanItem(db.Model):
    __tablename__ = "plan_items"

    id = db.Column(db.Integer, primary_key=True)

    health_plan_id = db.Column(
        db.Integer,
        db.ForeignKey("health_plans.id"),
        nullable=False
    )

    category = db.Column(db.String(50), nullable=False)

    title = db.Column(db.String(255), nullable=False)
    instructions = db.Column(db.Text, nullable=False)

    purpose = db.Column(db.Text)
    frequency = db.Column(db.String(100))
    duration = db.Column(db.String(100))
    caution = db.Column(db.Text)

    sort_order = db.Column(db.Integer, default=0)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    health_plan = db.relationship(
        "HealthPlan",
        back_populates="items"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "health_plan_id": self.health_plan_id,
            "category": self.category,
            "title": self.title,
            "instructions": self.instructions,
            "purpose": self.purpose,
            "frequency": self.frequency,
            "duration": self.duration,
            "caution": self.caution,
            "sort_order": self.sort_order,
        }