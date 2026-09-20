from datetime import datetime
from extensions import db


class Medication(db.Model):
    __tablename__ = "medications"

    id = db.Column(db.Integer, primary_key=True)

    health_profile_id = db.Column(
        db.Integer,
        db.ForeignKey("health_profiles.id"),
        nullable=False
    )

    name = db.Column(db.String(150), nullable=False)
    dosage = db.Column(db.String(100))
    frequency = db.Column(db.String(100))
    reason = db.Column(db.String(255))

    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)

    active = db.Column(db.Boolean, default=True)

    notes = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    health_profile = db.relationship(
        "HealthProfile",
        back_populates="medications"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "health_profile_id": self.health_profile_id,
            "name": self.name,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "reason": self.reason,
            "start_date": (
                self.start_date.isoformat()
                if self.start_date else None
            ),
            "end_date": (
                self.end_date.isoformat()
                if self.end_date else None
            ),
            "active": self.active,
            "notes": self.notes,
        }