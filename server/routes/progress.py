from datetime import datetime

from flask import Blueprint, jsonify, request

from extensions import db
from models import ProgressEntry, User, HealthPlan


progress_bp = Blueprint("progress", __name__)


@progress_bp.get("/api/members/<int:member_id>/progress")
def get_member_progress(member_id):
    member = db.session.get(User, member_id)

    if not member:
        return jsonify({
            "error": "Member not found"
        }), 404

    entries = (
        ProgressEntry.query
        .filter_by(member_id=member_id)
        .order_by(ProgressEntry.recorded_at.desc())
        .all()
    )

    return jsonify([
        entry.to_dict()
        for entry in entries
    ])


@progress_bp.post("/api/members/<int:member_id>/progress")
def create_progress_entry(member_id):
    member = db.session.get(User, member_id)

    if not member:
        return jsonify({
            "error": "Member not found"
        }), 404

    data = request.get_json() or {}

    category = data.get("category")

    if not category:
        return jsonify({
            "error": "category is required"
        }), 400

    plan_id = data.get("plan_id")

    if plan_id is not None:
        plan = db.session.get(
            HealthPlan,
            plan_id
        )

        if not plan:
            return jsonify({
                "error": "Plan not found"
            }), 404

        if plan.member_id != member_id:
            return jsonify({
                "error": "Plan does not belong to member"
            }), 400

    recorded_at = datetime.utcnow()

    if data.get("recorded_at"):
        try:
            recorded_at = datetime.fromisoformat(
                data["recorded_at"]
            )
        except ValueError:
            return jsonify({
                "error": "Invalid recorded_at"
            }), 400

    entry = ProgressEntry(
        member_id=member_id,
        plan_id=plan_id,
        category=category.upper(),
        value=data.get("value"),
        unit=data.get("unit"),
        completed=data.get(
            "completed",
            False
        ),
        note=data.get("note"),
        recorded_at=recorded_at,
    )

    db.session.add(entry)
    db.session.commit()

    return jsonify(
        entry.to_dict()
    ), 201