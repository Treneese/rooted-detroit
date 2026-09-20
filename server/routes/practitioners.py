from datetime import datetime

from flask import Blueprint, jsonify, request

from extensions import db
from models import (
    User,
    Practitioner,
    MemberPractitioner,
    HealthPlan,
    PlanItem,
)




practitioners_bp = Blueprint("practitioners", __name__)


def parse_date(value, field_name):
    if not value:
        return None, None

    try:
        return datetime.strptime(
            value,
            "%Y-%m-%d"
        ).date(), None
    except ValueError:
        return None, f"{field_name} must use YYYY-MM-DD"


@practitioners_bp.post("/api/practitioners")
def create_practitioner():
    data = request.get_json() or {}

    if not data.get("first_name"):
        return jsonify({"error": "first_name is required"}), 400

    if not data.get("last_name"):
        return jsonify({"error": "last_name is required"}), 400

    if not data.get("professional_type"):
        return jsonify({
            "error": "professional_type is required"
        }), 400

    practitioner = Practitioner(
        first_name=data["first_name"].strip(),
        last_name=data["last_name"].strip(),
        professional_type=data["professional_type"],
        credentials=data.get("credentials"),
        specialties=data.get("specialties"),
        organization=data.get("organization"),
        bio=data.get("bio"),
        city=data.get("city", "Detroit"),
        state=data.get("state", "MI"),
        accepts_new_members=data.get(
            "accepts_new_members",
            True
        ),
        verified=data.get("verified", False)
    )

    db.session.add(practitioner)
    db.session.commit()

    return jsonify(practitioner.to_dict()), 201


@practitioners_bp.get("/api/practitioners")
def list_practitioners():
    practitioners = Practitioner.query.order_by(
        Practitioner.last_name
    ).all()

    return jsonify([
        practitioner.to_dict()
        for practitioner in practitioners
    ])


@practitioners_bp.post(
    "/api/members/<int:member_id>/practitioners/<int:practitioner_id>"
)
def connect_practitioner(member_id, practitioner_id):
    member = db.session.get(User, member_id)
    practitioner = db.session.get(
        Practitioner,
        practitioner_id
    )

    if not member:
        return jsonify({"error": "Member not found"}), 404

    if not practitioner:
        return jsonify({
            "error": "Practitioner not found"
        }), 404

    existing = MemberPractitioner.query.filter_by(
        member_id=member_id,
        practitioner_id=practitioner_id
    ).first()

    if existing:
        return jsonify(existing.to_dict()), 200

    relationship = MemberPractitioner(
        member_id=member_id,
        practitioner_id=practitioner_id
    )

    db.session.add(relationship)
    db.session.commit()

    return jsonify(relationship.to_dict()), 201


@practitioners_bp.post(
    "/api/members/<int:member_id>/plans"
)
def create_health_plan(member_id):
    member = db.session.get(User, member_id)

    if not member:
        return jsonify({"error": "Member not found"}), 404

    data = request.get_json() or {}

    practitioner_id = data.get("practitioner_id")

    practitioner = db.session.get(
        Practitioner,
        practitioner_id
    ) if practitioner_id else None

    if not practitioner:
        return jsonify({
            "error": "Valid practitioner_id is required"
        }), 400

    relationship = MemberPractitioner.query.filter_by(
        member_id=member_id,
        practitioner_id=practitioner_id,
        active=True
    ).first()

    if not relationship:
        return jsonify({
            "error": "Practitioner is not on member care team"
        }), 403

    if not data.get("title"):
        return jsonify({"error": "title is required"}), 400

    start_date, error = parse_date(
        data.get("start_date"),
        "start_date"
    )

    if error:
        return jsonify({"error": error}), 400

    review_date, error = parse_date(
        data.get("review_date"),
        "review_date"
    )

    if error:
        return jsonify({"error": error}), 400

    latest_plan = HealthPlan.query.filter_by(
        member_id=member_id
    ).order_by(
        HealthPlan.version.desc()
    ).first()

    next_version = (
        latest_plan.version + 1
        if latest_plan
        else 1
    )

    plan = HealthPlan(
        member_id=member_id,
        practitioner_id=practitioner_id,
        title=data["title"],
        summary=data.get("summary"),
        status="DRAFT",
         version=next_version,
        start_date=start_date,
        review_date=review_date
    )

    db.session.add(plan)
    db.session.commit()

    return jsonify(plan.to_dict()), 201


@practitioners_bp.post(
    "/api/plans/<int:plan_id>/items"
)
def create_plan_item(plan_id):
    plan = db.session.get(HealthPlan, plan_id)

    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    if plan.status != "DRAFT":
        return jsonify({
            "error": "Only draft plans can be edited"
        }), 409

    data = request.get_json() or {}

    if not data.get("category"):
        return jsonify({"error": "category is required"}), 400

    if not data.get("title"):
        return jsonify({"error": "title is required"}), 400

    if not data.get("instructions"):
        return jsonify({
            "error": "instructions are required"
        }), 400

    item = PlanItem(
        health_plan_id=plan.id,
        category=data["category"].upper(),
        title=data["title"],
        instructions=data["instructions"],
        purpose=data.get("purpose"),
        frequency=data.get("frequency"),
        duration=data.get("duration"),
        caution=data.get("caution"),
        sort_order=data.get("sort_order", 0)
    )

    db.session.add(item)
    db.session.commit()

    return jsonify(item.to_dict()), 201


@practitioners_bp.patch(
    "/api/plans/<int:plan_id>/approve"
)
def approve_health_plan(plan_id):
    plan = db.session.get(HealthPlan, plan_id)

    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    if not plan.items:
        return jsonify({
            "error": "Cannot approve an empty plan"
        }), 400

    existing_active_plans = HealthPlan.query.filter(
        HealthPlan.member_id == plan.member_id,
        HealthPlan.id != plan.id,
        HealthPlan.status == "ACTIVE"
    ).all()

    for existing_plan in existing_active_plans:
        existing_plan.status = "SUPERSEDED"

    plan.status = "ACTIVE"
    plan.approved_at = datetime.utcnow()

    db.session.commit()

    return jsonify(plan.to_dict())

@practitioners_bp.get(
    "/api/members/<int:member_id>/plans"
)
def get_member_plans(member_id):
    member = db.session.get(User, member_id)

    if not member:
        return jsonify({"error": "Member not found"}), 404

    plans = HealthPlan.query.filter_by(
        member_id=member_id
    ).order_by(
        HealthPlan.created_at.desc()
    ).all()

    return jsonify([
        plan.to_dict()
        for plan in plans
    ])

@practitioners_bp.post("/api/plans/<int:plan_id>/clone-items-from/<int:source_plan_id>")
def clone_plan_items(plan_id, source_plan_id):
    target_plan = db.session.get(HealthPlan, plan_id)
    source_plan = db.session.get(HealthPlan, source_plan_id)

    if not target_plan:
        return jsonify({
            "error": "Target plan not found"
        }), 404

    if not source_plan:
        return jsonify({
            "error": "Source plan not found"
        }), 404

    if target_plan.status != "DRAFT":
        return jsonify({
            "error": "Only draft plans can be edited"
        }), 409

    if target_plan.member_id != source_plan.member_id:
        return jsonify({
            "error": "Plans must belong to the same member"
        }), 400

    if target_plan.items:
        return jsonify({
            "error": "Target plan already contains items"
        }), 409

    for item in source_plan.items:
        cloned_item = PlanItem(
            health_plan_id=target_plan.id,
            category=item.category,
            title=item.title,
            purpose=item.purpose,
            instructions=item.instructions,
            frequency=item.frequency,
            duration=item.duration,
            caution=item.caution,
            sort_order=item.sort_order,
        )

        db.session.add(cloned_item)

    db.session.commit()

    return jsonify(target_plan.to_dict()), 201

@practitioners_bp.post(
    "/api/plans/<int:plan_id>/create-revision"
)
def create_plan_revision(plan_id):
    source_plan = db.session.get(HealthPlan, plan_id)

    if not source_plan:
        return jsonify({"error": "Plan not found"}), 404

    if source_plan.status != "ACTIVE":
        return jsonify({
            "error": "A revision must be created from the active plan"
        }), 409

    existing_draft = (
        HealthPlan.query
        .filter_by(
            member_id=source_plan.member_id,
            status="DRAFT"
        )
        .order_by(HealthPlan.version.desc())
        .first()
    )

    if existing_draft:
        return jsonify({
            "error": "A draft revision already exists",
            "draft": existing_draft.to_dict(),
        }), 409

    latest_plan = (
        HealthPlan.query
        .filter_by(member_id=source_plan.member_id)
        .order_by(HealthPlan.version.desc())
        .first()
    )

    next_version = (
        latest_plan.version + 1
        if latest_plan
        else source_plan.version + 1
    )

    revision = HealthPlan(
        member_id=source_plan.member_id,
        practitioner_id=source_plan.practitioner_id,
        title=source_plan.title,
        summary=source_plan.summary,
        status="DRAFT",
        version=next_version,
        start_date=source_plan.start_date,
        review_date=source_plan.review_date,
    )

    db.session.add(revision)
    db.session.flush()

    for item in source_plan.items:
        cloned_item = PlanItem(
            health_plan_id=revision.id,
            category=item.category,
            title=item.title,
            purpose=item.purpose,
            instructions=item.instructions,
            frequency=item.frequency,
            duration=item.duration,
            caution=item.caution,
            sort_order=item.sort_order,
        )

        db.session.add(cloned_item)

    db.session.commit()

    return jsonify(revision.to_dict()), 201