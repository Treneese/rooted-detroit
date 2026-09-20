from datetime import datetime

from flask import Blueprint, jsonify, request

from extensions import db
from models import User, HealthProfile


members_bp = Blueprint("members", __name__)


@members_bp.post("/api/members")
def create_member():
    data = request.get_json() or {}

    required_fields = ["first_name", "last_name", "email"]

    missing = [
        field for field in required_fields
        if not data.get(field)
    ]

    if missing:
        return jsonify({
            "error": "Missing required fields",
            "fields": missing
        }), 400

    existing_user = User.query.filter_by(
        email=data["email"].strip().lower()
    ).first()

    if existing_user:
        return jsonify({
            "error": "A user with this email already exists"
        }), 409

    member = User(
        first_name=data["first_name"].strip(),
        last_name=data["last_name"].strip(),
        email=data["email"].strip().lower(),
        role="MEMBER"
    )

    db.session.add(member)
    db.session.commit()

    return jsonify(member.to_dict()), 201


@members_bp.get("/api/members/<int:user_id>")
def get_member(user_id):
    member = db.session.get(User, user_id)

    if not member:
        return jsonify({
            "error": "Member not found"
        }), 404

    return jsonify(member.to_dict())


@members_bp.post("/api/members/<int:user_id>/health-profile")
def create_health_profile(user_id):
    member = db.session.get(User, user_id)

    if not member:
        return jsonify({
            "error": "Member not found"
        }), 404

    if member.health_profile:
        return jsonify({
            "error": "Health profile already exists"
        }), 409

    data = request.get_json() or {}

    date_of_birth = None

    if data.get("date_of_birth"):
        try:
            date_of_birth = datetime.strptime(
                data["date_of_birth"],
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return jsonify({
                "error": "date_of_birth must use YYYY-MM-DD"
            }), 400

    profile = HealthProfile(
        user_id=user_id,
        date_of_birth=date_of_birth,
        biological_sex=data.get("biological_sex"),
        height_cm=data.get("height_cm"),
        weight_kg=data.get("weight_kg"),
        primary_goal=data.get("primary_goal")
    )

    db.session.add(profile)
    db.session.commit()

    return jsonify(profile.to_dict()), 201


@members_bp.get("/api/members/<int:user_id>/health-profile")
def get_health_profile(user_id):
    member = db.session.get(User, user_id)

    if not member:
        return jsonify({
            "error": "Member not found"
        }), 404

    if not member.health_profile:
        return jsonify({
            "error": "Health profile not found"
        }), 404

    return jsonify(member.health_profile.to_dict())