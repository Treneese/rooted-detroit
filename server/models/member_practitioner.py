from datetime import datetime
from extensions import db


class MemberPractitioner(db.Model):
    __tablename__ = "member_practitioners"

    id = db.Column(db.Integer, primary_key=True)

    member_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    practitioner_id = db.Column(
        db.Integer,
        db.ForeignKey("practitioners.id"),
        nullable=False
    )

    relationship_type = db.Column(
        db.String(100),
        default="CARE_TEAM"
    )

    active = db.Column(db.Boolean, default=True)

    connected_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    member = db.relationship(
        "User",
        back_populates="practitioner_relationships"
    )

    practitioner = db.relationship(
        "Practitioner",
        back_populates="member_relationships"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "member_id",
            "practitioner_id",
            name="uq_member_practitioner"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "member_id": self.member_id,
            "practitioner_id": self.practitioner_id,
            "relationship_type": self.relationship_type,
            "active": self.active,
            "connected_at": (
                self.connected_at.isoformat()
                if self.connected_at else None
            ),
            "practitioner": (
                self.practitioner.to_dict()
                if self.practitioner else None
            ),
        }