from datetime import datetime

from extensions import db


class WellnessResource(db.Model):
    __tablename__ = "wellness_resources"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(160),
        nullable=False
    )

    category = db.Column(
        db.String(50),
        nullable=False
    )

    description = db.Column(
        db.Text
    )

    address = db.Column(
        db.String(200)
    )

    neighborhood = db.Column(
        db.String(100)
    )

    city = db.Column(
        db.String(80),
        default="Detroit",
        nullable=False
    )

    state = db.Column(
        db.String(20),
        default="MI",
        nullable=False
    )

    latitude = db.Column(
        db.Float
    )

    longitude = db.Column(
        db.Float
    )

    cultural_tags = db.Column(db.Text)
    dietary_tags = db.Column(db.Text)

    services = db.Column(db.Text)

    resource_type = db.Column(
        db.String(50)
    )

    languages = db.Column(db.Text)

    appointment_required = db.Column(db.Boolean)

    source_url = db.Column(db.String(500))

    cost_level = db.Column(
        db.String(30)
    )

    accessibility_notes = db.Column(
        db.Text
    )

    transportation_notes = db.Column(
        db.Text
    )

    website_url = db.Column(
        db.String(500)
    )

    image_url = db.Column(
        db.String(500)
    )

    verified = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "resource_type": self.resource_type,
            "description": self.description,
            "address": self.address,
            "neighborhood": self.neighborhood,
            "city": self.city,
            "state": self.state,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "cost_level": self.cost_level,
            "cultural_tags": self.cultural_tags,
            "dietary_tags": self.dietary_tags,
            "services": self.services,
            "languages": self.languages,
            "appointment_required": self.appointment_required,
            "accessibility_notes": self.accessibility_notes,
            "transportation_notes": self.transportation_notes,
            "website_url": self.website_url,
            "source_url": self.source_url,
            "image_url": self.image_url,
            "verified": self.verified,
            "active": self.active,
        }