from datetime import datetime
from extensions import db


class LifestyleAssessment(db.Model):
    __tablename__ = "lifestyle_assessments"

    id = db.Column(db.Integer, primary_key=True)

    health_profile_id = db.Column(
        db.Integer,
        db.ForeignKey("health_profiles.id"),
        nullable=False
    )

    # NUTRITION
    meals_per_day = db.Column(db.Integer)
    fruit_vegetable_servings = db.Column(db.Float)
    processed_food_frequency = db.Column(db.String(50))
    dietary_pattern = db.Column(db.String(100))
    water_cups_per_day = db.Column(db.Float)

    # SLEEP
    sleep_hours = db.Column(db.Float)
    sleep_quality = db.Column(db.Integer)
    sleep_schedule_consistent = db.Column(db.Boolean)

    # MOVEMENT
    exercise_days_per_week = db.Column(db.Integer)
    exercise_minutes_per_session = db.Column(db.Integer)
    sedentary_hours_per_day = db.Column(db.Float)
    movement_notes = db.Column(db.Text)

    # STRESS
    stress_level = db.Column(db.Integer)
    primary_stressors = db.Column(db.Text)
    relaxation_practice = db.Column(db.String(255))

    # NATURE / ENVIRONMENT
    outdoor_days_per_week = db.Column(db.Integer)
    outdoor_minutes_average = db.Column(db.Integer)
    environment_notes = db.Column(db.Text)

    # NATURAL HEALTH
    current_herbs_teas = db.Column(db.Text)
    current_supplements = db.Column(db.Text)
    natural_health_goals = db.Column(db.Text)

    # GENERAL
    energy_level = db.Column(db.Integer)
    personal_goals = db.Column(db.Text)
    barriers = db.Column(db.Text)

    assessed_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    health_profile = db.relationship(
        "HealthProfile",
        back_populates="lifestyle_assessments"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "health_profile_id": self.health_profile_id,

            "nutrition": {
                "meals_per_day": self.meals_per_day,
                "fruit_vegetable_servings": self.fruit_vegetable_servings,
                "processed_food_frequency": self.processed_food_frequency,
                "dietary_pattern": self.dietary_pattern,
                "water_cups_per_day": self.water_cups_per_day,
            },

            "sleep": {
                "sleep_hours": self.sleep_hours,
                "sleep_quality": self.sleep_quality,
                "sleep_schedule_consistent":
                    self.sleep_schedule_consistent,
            },

            "movement": {
                "exercise_days_per_week": self.exercise_days_per_week,
                "exercise_minutes_per_session":
                    self.exercise_minutes_per_session,
                "sedentary_hours_per_day": self.sedentary_hours_per_day,
                "movement_notes": self.movement_notes,
            },

            "stress": {
                "stress_level": self.stress_level,
                "primary_stressors": self.primary_stressors,
                "relaxation_practice": self.relaxation_practice,
            },

            "nature_environment": {
                "outdoor_days_per_week": self.outdoor_days_per_week,
                "outdoor_minutes_average":
                    self.outdoor_minutes_average,
                "environment_notes": self.environment_notes,
            },

            "natural_health": {
                "current_herbs_teas": self.current_herbs_teas,
                "current_supplements": self.current_supplements,
                "natural_health_goals": self.natural_health_goals,
            },

            "general": {
                "energy_level": self.energy_level,
                "personal_goals": self.personal_goals,
                "barriers": self.barriers,
            },

            "assessed_at": self.assessed_at.isoformat()
            if self.assessed_at else None,
        }