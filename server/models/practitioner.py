from datetime import datetime
from extensions import db


class Practitioner(db.Model):
    __tablename__ = "practitioners"

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)

    professional_type = db.Column(db.String(100), nullable=False)
    credentials = db.Column(db.String(255))
    specialties = db.Column(db.Text)

    organization = db.Column(db.String(255))
    bio = db.Column(db.Text)

    city = db.Column(db.String(100), default="Detroit")
    state = db.Column(db.String(50), default="MI")

    accepts_new_members = db.Column(db.Boolean, default=True)
    verified = db.Column(db.Boolean, default=False)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    member_relationships = db.relationship(
        "MemberPractitioner",
        back_populates="practitioner",
        cascade="all, delete-orphan"
    )

    plans = db.relationship(
        "HealthPlan",
        back_populates="practitioner"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "professional_type": self.professional_type,
            "credentials": self.credentials,
            "specialties": self.specialties,
            "organization": self.organization,
            "bio": self.bio,
            "city": self.city,
            "state": self.state,
            "accepts_new_members": self.accepts_new_members,
            "verified": self.verified,
        }