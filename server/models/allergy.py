from datetime import datetime
from extensions import db


class Allergy(db.Model):
    __tablename__ = "allergies"

    id = db.Column(db.Integer, primary_key=True)

    health_profile_id = db.Column(
        db.Integer,
        db.ForeignKey("health_profiles.id"),
        nullable=False
    )

    allergen = db.Column(db.String(150), nullable=False)

    allergy_type = db.Column(db.String(50))
    reaction = db.Column(db.Text)
    severity = db.Column(db.String(50))

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    health_profile = db.relationship(
        "HealthProfile",
        back_populates="allergies"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "health_profile_id": self.health_profile_id,
            "allergen": self.allergen,
            "allergy_type": self.allergy_type,
            "reaction": self.reaction,
            "severity": self.severity,
        }