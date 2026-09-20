from datetime import datetime

from flask import Blueprint, jsonify, request

from extensions import db
from models import (
    HealthProfile,
    MedicalCondition,
    Medication,
    Allergy,
)


medical_bp = Blueprint("medical", __name__)


def get_profile(user_id):
    return HealthProfile.query.filter_by(user_id=user_id).first()


def parse_date(value, field_name):
    if not value:
        return None, None

    try:
        return datetime.strptime(value, "%Y-%m-%d").date(), None
    except ValueError:
        return None, f"{field_name} must use YYYY-MM-DD"


# -------------------------
# MEDICAL CONDITIONS
# -------------------------

@medical_bp.post("/api/members/<int:user_id>/conditions")
def create_condition(user_id):
    profile = get_profile(user_id)

    if not profile:
        return jsonify({"error": "Health profile not found"}), 404

    data = request.get_json() or {}

    if not data.get("name"):
        return jsonify({"error": "Condition name is required"}), 400

    diagnosed_date, error = parse_date(
        data.get("diagnosed_date"),
        "diagnosed_date"
    )

    if error:
        return jsonify({"error": error}), 400

    condition = MedicalCondition(
        health_profile_id=profile.id,
        name=data["name"].strip(),
        diagnosed_date=diagnosed_date,
        status=data.get("status", "ACTIVE"),
        notes=data.get("notes")
    )

    db.session.add(condition)
    db.session.commit()

    return jsonify(condition.to_dict()), 201


# -------------------------
# MEDICATIONS
# -------------------------

@medical_bp.post("/api/members/<int:user_id>/medications")
def create_medication(user_id):
    profile = get_profile(user_id)

    if not profile:
        return jsonify({"error": "Health profile not found"}), 404

    data = request.get_json() or {}

    if not data.get("name"):
        return jsonify({"error": "Medication name is required"}), 400

    start_date, error = parse_date(
        data.get("start_date"),
        "start_date"
    )

    if error:
        return jsonify({"error": error}), 400

    end_date, error = parse_date(
        data.get("end_date"),
        "end_date"
    )

    if error:
        return jsonify({"error": error}), 400

    medication = Medication(
        health_profile_id=profile.id,
        name=data["name"].strip(),
        dosage=data.get("dosage"),
        frequency=data.get("frequency"),
        reason=data.get("reason"),
        start_date=start_date,
        end_date=end_date,
        active=data.get("active", True),
        notes=data.get("notes")
    )

    db.session.add(medication)
    db.session.commit()

    return jsonify(medication.to_dict()), 201


# -------------------------
# ALLERGIES
# -------------------------

@medical_bp.post("/api/members/<int:user_id>/allergies")
def create_allergy(user_id):
    profile = get_profile(user_id)

    if not profile:
        return jsonify({"error": "Health profile not found"}), 404

    data = request.get_json() or {}

    if not data.get("allergen"):
        return jsonify({"error": "Allergen is required"}), 400

    allergy = Allergy(
        health_profile_id=profile.id,
        allergen=data["allergen"].strip(),
        allergy_type=data.get("allergy_type"),
        reaction=data.get("reaction"),
        severity=data.get("severity")
    )

    db.session.add(allergy)
    db.session.commit()

    return jsonify(allergy.to_dict()), 201