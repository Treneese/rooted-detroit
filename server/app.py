from flask import Flask, jsonify
from flask_cors import CORS

from extensions import db, migrate


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///rooted.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    migrate.init_app(app, db)

    CORS(app)

    from routes.members import members_bp
    app.register_blueprint(members_bp)
    from routes.medical import medical_bp
    app.register_blueprint(medical_bp)
    from routes.health_data import health_data_bp
    app.register_blueprint(health_data_bp)
    from routes.practitioners import practitioners_bp
    app.register_blueprint(practitioners_bp)
    from routes.resources import resources_bp
    app.register_blueprint(resources_bp)
    from routes.progress import progress_bp
    app.register_blueprint(progress_bp)
    from routes.intelligence import intelligence_bp
    app.register_blueprint(intelligence_bp)
    

    # Import models after extensions are initialized
    from models import (
    User,
    HealthProfile,
    MedicalCondition,
    Medication,
    Allergy,
)

    @app.get("/api/health")
    def health():
        return jsonify({
            "status": "ok",
            "service": "ROOTED Detroit API"
        })

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, port=5557)