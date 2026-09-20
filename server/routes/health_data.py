from datetime import datetime

from flask import Blueprint, jsonify, request

from extensions import db
from models import HealthProfile, LabResult, LifestyleAssessment


health_data_bp = Blueprint("health_data", __name__)


def get_profile(user_id):
    return HealthProfile.query.filter_by(user_id=user_id).first()


@health_data_bp.post("/api/members/<int:user_id>/labs")
def create_lab_result(user_id):
    profile = get_profile(user_id)

    if not profile:
        return jsonify({"error": "Health profile not found"}), 404

    data = request.get_json() or {}

    if not data.get("test_name"):
        return jsonify({"error": "test_name is required"}), 400

    collected_date = None

    if data.get("collected_date"):
        try:
            collected_date = datetime.strptime(
                data["collected_date"],
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return jsonify({
                "error": "collected_date must use YYYY-MM-DD"
            }), 400

    lab = LabResult(
        health_profile_id=profile.id,
        test_name=data["test_name"],
        category=data.get("category"),
        value=data.get("value"),
        value_text=data.get("value_text"),
        unit=data.get("unit"),
        reference_low=data.get("reference_low"),
        reference_high=data.get("reference_high"),
        reference_text=data.get("reference_text"),
        flag=data.get("flag"),
        collected_date=collected_date,
        source=data.get("source"),
        notes=data.get("notes")
    )

    db.session.add(lab)
    db.session.commit()

    return jsonify(lab.to_dict()), 201


@health_data_bp.post("/api/members/<int:user_id>/assessments")
def create_assessment(user_id):
    profile = get_profile(user_id)

    if not profile:
        return jsonify({"error": "Health profile not found"}), 404

    data = request.get_json() or {}

    assessment = LifestyleAssessment(
        health_profile_id=profile.id,

        meals_per_day=data.get("meals_per_day"),
        fruit_vegetable_servings=data.get(
            "fruit_vegetable_servings"
        ),
        processed_food_frequency=data.get(
            "processed_food_frequency"
        ),
        dietary_pattern=data.get("dietary_pattern"),
        water_cups_per_day=data.get("water_cups_per_day"),

        sleep_hours=data.get("sleep_hours"),
        sleep_quality=data.get("sleep_quality"),
        sleep_schedule_consistent=data.get(
            "sleep_schedule_consistent"
        ),

        exercise_days_per_week=data.get(
            "exercise_days_per_week"
        ),
        exercise_minutes_per_session=data.get(
            "exercise_minutes_per_session"
        ),
        sedentary_hours_per_day=data.get(
            "sedentary_hours_per_day"
        ),
        movement_notes=data.get("movement_notes"),

        stress_level=data.get("stress_level"),
        primary_stressors=data.get("primary_stressors"),
        relaxation_practice=data.get("relaxation_practice"),

        outdoor_days_per_week=data.get(
            "outdoor_days_per_week"
        ),
        outdoor_minutes_average=data.get(
            "outdoor_minutes_average"
        ),
        environment_notes=data.get("environment_notes"),

        current_herbs_teas=data.get("current_herbs_teas"),
        current_supplements=data.get("current_supplements"),
        natural_health_goals=data.get(
            "natural_health_goals"
        ),

        energy_level=data.get("energy_level"),
        personal_goals=data.get("personal_goals"),
        barriers=data.get("barriers")
    )

    db.session.add(assessment)
    db.session.commit()

    return jsonify(assessment.to_dict()), 201