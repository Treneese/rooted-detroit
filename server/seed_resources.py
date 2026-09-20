from app import app
from extensions import db
from models import WellnessResource


resources = [
    {
        "name": "Al-Haramain International Food",
        "category": "FOOD",
        "resource_type": "INTERNATIONAL_MARKET",
        "description": (
            "International grocery market with fresh produce, "
            "halal meats, pantry staples, and foods from Middle "
            "Eastern, South Asian, and other traditions."
        ),
        "address": "9027 Joseph Campau Ave",
        "neighborhood": "Hamtramck",
        "city": "Hamtramck",
        "state": "MI",
        "cultural_tags": (
            "Arab, Middle Eastern, South Asian, International"
        ),
        "dietary_tags": "Halal, Fresh Produce",
        "services": "Groceries, Produce, Halal Meat",
        "verified": True,
    },
    {
        "name": "Family African Market",
        "category": "FOOD",
        "resource_type": "CULTURAL_MARKET",
        "description": (
            "Detroit African market offering groceries, household "
            "goods, and health and wellness products."
        ),
        "address": "20727 W Seven Mile Rd",
        "city": "Detroit",
        "state": "MI",
        "cultural_tags": "African, West African",
        "dietary_tags": "African Foods",
        "services": (
            "Groceries, Cultural Foods, Health and Wellness Products"
        ),
        "verified": True,
    },
    {
        "name": "Saad Wholesale Meats",
        "category": "FOOD",
        "resource_type": "HALAL_MARKET",
        "description": (
            "Detroit Eastern Market butcher specializing in "
            "halal meat and poultry."
        ),
        "address": "2814 Orleans St",
        "neighborhood": "Eastern Market",
        "city": "Detroit",
        "state": "MI",
        "cultural_tags": "Arab, Middle Eastern",
        "dietary_tags": "Halal, Zabiha",
        "services": "Halal Meat, Poultry",
        "verified": True,
    },
    {
        "name": "Hefling's Amish Farm Market",
        "category": "FOOD",
        "resource_type": "AMISH_MARKET",
        "description": (
            "Metro Detroit-area market specializing in naturally "
            "raised meats, produce, Amish-raised foods, eggs, "
            "dairy, bakery items, and groceries."
        ),
        "address": "38953 Harper Ave",
        "city": "Clinton Township",
        "state": "MI",
        "cultural_tags": "Amish, Michigan Farm Food",
        "dietary_tags": "Fresh Produce, Naturally Raised Foods",
        "services": (
            "Produce, Meat, Eggs, Dairy, Bakery, Grocery"
        ),
        "verified": True,
    },
    {
        "name": "Goddess Herbs",
        "category": "HERBAL",
        "resource_type": "HERB_SHOP",
        "description": (
            "Detroit herb shop offering herbal products and "
            "wellness-focused retail resources."
        ),
        "address": "7718 W McNichols Rd",
        "city": "Detroit",
        "state": "MI",
        "services": "Herbs, Herbal Products, Wellness Retail",
        "verified": True,
    },
    {
        "name": "Universal Body Oils & Herbs",
        "category": "HERBAL",
        "resource_type": "HERB_SHOP",
        "description": (
            "Detroit natural-products shop offering herbs, teas, "
            "tinctures, supplements, and body-care products."
        ),
        "address": "18245 Livernois",
        "city": "Detroit",
        "state": "MI",
        "services": (
            "Bulk Herbs, Herbal Tea, Tinctures, Supplements"
        ),
        "verified": True,
    },
    {
        "name": "Advantage Health",
        "category": "CLINICAL",
        "resource_type": "COMMUNITY_HEALTH_CENTER",
        "description": (
            "Detroit community health center providing integrated "
            "health services."
        ),
        "address": "101 E Alexandrine St",
        "neighborhood": "Midtown",
        "city": "Detroit",
        "state": "MI",
        "services": (
            "Primary Care, Behavioral Health, Community Health"
        ),
        "verified": True,
    },
    {
        "name": "Belle Isle Park",
        "category": "NATURE",
        "resource_type": "PARK",
        "description": (
            "Detroit River island park supporting walking, cycling, "
            "outdoor recreation, nature access, and relaxation."
        ),
        "address": "99 Pleasure Dr",
        "city": "Detroit",
        "state": "MI",
        "services": (
            "Walking, Cycling, Nature, Recreation, Outdoor Space"
        ),
        "verified": True,
    },
    {
        "name": "Detroit Riverwalk",
        "category": "MOVEMENT",
        "resource_type": "GREENWAY",
        "description": (
            "Detroit waterfront promenade supporting walking, "
            "running, cycling, recreation, and outdoor activity."
        ),
        "address": "1340 Atwater St",
        "city": "Detroit",
        "state": "MI",
        "services": (
            "Walking, Running, Cycling, Outdoor Recreation"
        ),
        "verified": True,
    },
]

with app.app_context():
    added = 0

    for data in resources:
        existing = WellnessResource.query.filter_by(
            name=data["name"]
        ).first()

        if existing:
            print(f"Skipping {data['name']} — already exists")
            continue

        resource = WellnessResource(**data)

        db.session.add(resource)
        added += 1

    db.session.commit()

    print(f"Added {added} ROOTED Detroit resources.")