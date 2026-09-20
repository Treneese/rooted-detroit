from datetime import datetime
from extensions import db


class LabResult(db.Model):
    __tablename__ = "lab_results"

    id = db.Column(db.Integer, primary_key=True)

    health_profile_id = db.Column(
        db.Integer,
        db.ForeignKey("health_profiles.id"),
        nullable=False
    )

    test_name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100))

    value = db.Column(db.Float)
    value_text = db.Column(db.String(255))
    unit = db.Column(db.String(50))

    reference_low = db.Column(db.Float)
    reference_high = db.Column(db.Float)
    reference_text = db.Column(db.String(255))

    flag = db.Column(db.String(50))

    collected_date = db.Column(db.Date)
    source = db.Column(db.String(150))
    notes = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    health_profile = db.relationship(
        "HealthProfile",
        back_populates="lab_results"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "health_profile_id": self.health_profile_id,
            "test_name": self.test_name,
            "category": self.category,
            "value": self.value,
            "value_text": self.value_text,
            "unit": self.unit,
            "reference_low": self.reference_low,
            "reference_high": self.reference_high,
            "reference_text": self.reference_text,
            "flag": self.flag,
            "collected_date": (
                self.collected_date.isoformat()
                if self.collected_date else None
            ),
            "source": self.source,
            "notes": self.notes,
        }