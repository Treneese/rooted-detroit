from datetime import datetime
from extensions import db


class ProgressEntry(db.Model):
    __tablename__ = "progress_entries"

    id = db.Column(db.Integer, primary_key=True)

    member_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    plan_id = db.Column(
        db.Integer,
        db.ForeignKey("health_plans.id"),
        nullable=True
    )

    category = db.Column(
        db.String(50),
        nullable=False
    )

    value = db.Column(
        db.Float,
        nullable=True
    )

    unit = db.Column(
        db.String(40),
        nullable=True
    )

    completed = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    note = db.Column(
        db.Text,
        nullable=True
    )

    recorded_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "member_id": self.member_id,
            "plan_id": self.plan_id,
            "category": self.category,
            "value": self.value,
            "unit": self.unit,
            "completed": self.completed,
            "note": self.note,
            "recorded_at": self.recorded_at.isoformat(),
        }