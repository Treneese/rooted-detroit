from flask import Blueprint, jsonify, request

from extensions import db
from models import WellnessResource


resources_bp = Blueprint("resources", __name__)


@resources_bp.get("/api/resources")
def list_resources():
    query = WellnessResource.query.filter_by(
        active=True
    )

    category = request.args.get("category")
    neighborhood = request.args.get("neighborhood")

    if category:
        query = query.filter(
            WellnessResource.category == category.upper()
        )

    if neighborhood:
        query = query.filter(
            WellnessResource.neighborhood == neighborhood
        )

    resources = query.order_by(
        WellnessResource.name
    ).all()

    return jsonify([
        resource.to_dict()
        for resource in resources
    ])


@resources_bp.get("/api/resources/<int:resource_id>")
def get_resource(resource_id):
    resource = db.session.get(
        WellnessResource,
        resource_id
    )

    if not resource or not resource.active:
        return jsonify({
            "error": "Resource not found"
        }), 404

    return jsonify(resource.to_dict())

@resources_bp.patch("/api/resources/<int:resource_id>")
def update_resource(resource_id):
    resource = db.session.get(
        WellnessResource,
        resource_id
    )

    if not resource:
        return jsonify({
            "error": "Resource not found"
        }), 404

    data = request.get_json() or {}

    editable_fields = [
        "name",
        "category",
        "description",
        "address",
        "neighborhood",
        "city",
        "state",
        "latitude",
        "longitude",
        "cost_level",
        "accessibility_notes",
        "transportation_notes",
        "website_url",
        "image_url",
        "cultural_tags",
        "dietary_tags",
        "services",
        "resource_type",
        "languages",
        "appointment_required",
        "source_url",
        "verified",
        "active",
    ]

    for field in editable_fields:
        if field in data:
            setattr(resource, field, data[field])

    if resource.category:
        resource.category = resource.category.upper()

    db.session.commit()

    return jsonify(resource.to_dict())


@resources_bp.get("/api/resources/map")
def map_resources():
    resources = WellnessResource.query.filter(
        WellnessResource.active.is_(True),
        WellnessResource.latitude.isnot(None),
        WellnessResource.longitude.isnot(None)
    ).all()

    return jsonify([
        {
            "id": resource.id,
            "name": resource.name,
            "category": resource.category,
            "neighborhood": resource.neighborhood,
            "latitude": resource.latitude,
            "longitude": resource.longitude,
            "cost_level": resource.cost_level,
        }
        for resource in resources
    ])


@resources_bp.post("/api/resources")
def create_resource():
    data = request.get_json() or {}

    if not data.get("name"):
        return jsonify({
            "error": "name is required"
        }), 400

    if not data.get("category"):
        return jsonify({
            "error": "category is required"
        }), 400

    resource = WellnessResource(
        name=data["name"].strip(),
        category=data["category"].upper(),
        description=data.get("description"),
        address=data.get("address"),
        neighborhood=data.get("neighborhood"),
        city=data.get("city", "Detroit"),
        state=data.get("state", "MI"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        cost_level=data.get("cost_level"),
        accessibility_notes=data.get(
            "accessibility_notes"
        ),
        transportation_notes=data.get(
            "transportation_notes"
        ),
        website_url=data.get("website_url"),
        image_url=data.get("image_url"),
        verified=data.get("verified", False),
        active=data.get("active", True)
    )

    db.session.add(resource)
    db.session.commit()

    return jsonify(resource.to_dict()), 201