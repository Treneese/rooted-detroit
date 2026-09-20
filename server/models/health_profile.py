from datetime import datetime
from extensions import db


class HealthProfile(db.Model):
    __tablename__ = "health_profiles"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    date_of_birth = db.Column(db.Date)
    biological_sex = db.Column(db.String(50))

    height_cm = db.Column(db.Float)
    weight_kg = db.Column(db.Float)

    primary_goal = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    user = db.relationship(
        "User",
        back_populates="health_profile"
    )

    medical_conditions = db.relationship(
        "MedicalCondition",
        back_populates="health_profile",
        cascade="all, delete-orphan"
    )

    medications = db.relationship(
        "Medication",
        back_populates="health_profile",
        cascade="all, delete-orphan"
    )

    allergies = db.relationship(
        "Allergy",
        back_populates="health_profile",
        cascade="all, delete-orphan"
    )

    lab_results = db.relationship(
        "LabResult",
        back_populates="health_profile",
        cascade="all, delete-orphan"
    )

    lifestyle_assessments = db.relationship(
        "LifestyleAssessment",
        back_populates="health_profile",
        cascade="all, delete-orphan",
        order_by="LifestyleAssessment.assessed_at"
    )


    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "medical_conditions": [
                condition.to_dict()
                for condition in self.medical_conditions
            ],
            "medications": [
                medication.to_dict()
                for medication in self.medications
            ],
            "allergies": [
                allergy.to_dict()
                for allergy in self.allergies
            ],
            "date_of_birth": (
                self.date_of_birth.isoformat()
                if self.date_of_birth else None
            ),
            "lab_results": [
                lab.to_dict()
                for lab in self.lab_results
            ],
            "lifestyle_assessments": [
                assessment.to_dict()
                for assessment in self.lifestyle_assessments
            ],
            "biological_sex": self.biological_sex,
            "height_cm": self.height_cm,
            "weight_kg": self.weight_kg,
            "primary_goal": self.primary_goal,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at else None
            )
        }