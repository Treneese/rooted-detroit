from datetime import datetime
from extensions import db


class MedicalCondition(db.Model):
    __tablename__ = "medical_conditions"

    id = db.Column(db.Integer, primary_key=True)

    health_profile_id = db.Column(
        db.Integer,
        db.ForeignKey("health_profiles.id"),
        nullable=False
    )

    name = db.Column(db.String(150), nullable=False)
    diagnosed_date = db.Column(db.Date)
    status = db.Column(db.String(50), default="ACTIVE")
    notes = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    health_profile = db.relationship(
        "HealthProfile",
        back_populates="medical_conditions"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "health_profile_id": self.health_profile_id,
            "name": self.name,
            "diagnosed_date": (
                self.diagnosed_date.isoformat()
                if self.diagnosed_date else None
            ),
            "status": self.status,
            "notes": self.notes,
        }