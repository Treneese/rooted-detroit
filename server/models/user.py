from datetime import datetime
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)

    role = db.Column(db.String(50), nullable=False, default="MEMBER")

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    health_profile = db.relationship(
        "HealthProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    practitioner_relationships = db.relationship(
        "MemberPractitioner",
        back_populates="member",
        cascade="all, delete-orphan"
    )

    health_plans = db.relationship(
        "HealthPlan",
        back_populates="member",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat()
            if self.created_at else None
        }