from flask import Blueprint, jsonify, request
from models import (
    User,
    HealthProfile,
    LabResult,
    ProgressEntry,
    HealthPlan,
)

intelligence_bp = Blueprint("intelligence", __name__)


def make_insight(
    insight_id,
    category,
    title,
    summary,
    priority="INFO",
    evidence=None,
    requires_professional_review=False,
):
    return {
        "id": insight_id,
        "category": category,
        "title": title,
        "summary": summary,
        "priority": priority,
        "evidence": evidence or [],
        "requires_professional_review": requires_professional_review,
    }


@intelligence_bp.get("/api/members/<int:member_id>/insights")
def get_member_insights(member_id):
    member = User.query.get(member_id)

    if not member:
        return jsonify({"error": "Member not found"}), 404

    profile = HealthProfile.query.filter_by(
        user_id=member_id
    ).first()

    if not profile:
        return jsonify({"error": "Health profile not found"}), 404

    active_plan = (
        HealthPlan.query
        .filter_by(member_id=member_id, status="ACTIVE")
        .order_by(HealthPlan.version.desc())
        .first()
    )

    progress_entries = (
        ProgressEntry.query
        .filter_by(member_id=member_id)
        .order_by(ProgressEntry.recorded_at.desc())
        .all()
    )

    insights = []

    # -------------------------------------------------
    # PROGRESS: hydration
    # -------------------------------------------------

    hydration_entries = [
        entry for entry in progress_entries
        if entry.category == "HYDRATION"
        and entry.value is not None
    ]

    if (
        hydration_entries
        and profile.lifestyle_assessments
    ):
        latest_hydration = hydration_entries[0]

        assessment = profile.lifestyle_assessments[-1]

        baseline = getattr(
            assessment,
            "hydration_cups_per_day",
            None
        )

        if (
            baseline is not None
            and latest_hydration.value > baseline
        ):
            insights.append(
                make_insight(
                    "hydration-progress",
                    "PROGRESS",
                    "Hydration is trending upward",
                    (
                        f"Recent hydration check-in is "
                        f"{latest_hydration.value:g} cups compared "
                        f"with the recorded baseline of "
                        f"{baseline:g} cups per day."
                    ),
                    priority="POSITIVE",
                    evidence=[
                        {
                            "source": "LIFESTYLE_ASSESSMENT",
                            "label": "Baseline hydration",
                            "value": f"{baseline:g} cups/day",
                        },
                        {
                            "source": "PROGRESS_ENTRY",
                            "label": "Recent check-in",
                            "value": f"{latest_hydration.value:g} cups",
                        },
                    ],
                )
            )

    # -------------------------------------------------
    # PROGRESS: sleep
    # -------------------------------------------------

    sleep_entries = [
        entry for entry in progress_entries
        if entry.category == "SLEEP"
        and entry.value is not None
    ]

    if (
        sleep_entries
        and profile.lifestyle_assessments
    ):
        latest_sleep = sleep_entries[0]

        assessment = profile.lifestyle_assessments[-1]

        baseline = getattr(
            assessment,
            "sleep_hours",
            None
        )

        if (
            baseline is not None
            and latest_sleep.value > baseline
        ):
            insights.append(
                make_insight(
                    "sleep-progress",
                    "PROGRESS",
                    "Sleep duration has increased",
                    (
                        f"The latest sleep check-in is "
                        f"{latest_sleep.value:g} hours compared "
                        f"with the recorded baseline of "
                        f"{baseline:g} hours."
                    ),
                    priority="POSITIVE",
                    evidence=[
                        {
                            "source": "LIFESTYLE_ASSESSMENT",
                            "label": "Baseline sleep",
                            "value": f"{baseline:g} hours",
                        },
                        {
                            "source": "PROGRESS_ENTRY",
                            "label": "Recent check-in",
                            "value": f"{latest_sleep.value:g} hours",
                        },
                    ],
                )
            )

    # -------------------------------------------------
    # REVIEW: laboratory information
    # -------------------------------------------------

    lab_results = (
        LabResult.query
        .filter_by(health_profile_id=profile.id)
        .order_by(LabResult.id.desc())
        .all()
    )

    for lab in lab_results:
        if lab.value is None:
            continue

        value_text = f"{lab.value:g}"

        if lab.unit:
            value_text += f" {lab.unit}"

        insights.append(
            make_insight(
                f"lab-review-{lab.id}",
                "REVIEW",
                f"{lab.test_name} result available for review",
                (
                    f"A {lab.test_name} result of "
                    f"{value_text} is available in the member "
                    f"profile for professional review."
                ),
                priority="REVIEW",
                evidence=[
                    {
                        "source": "LAB_RESULT",
                        "label": lab.test_name,
                        "value": value_text,
                    }
                ],
                requires_professional_review=True,
            )
        )

    # -------------------------------------------------
    # SAFETY: herbal + medication context
    # -------------------------------------------------

    has_herbal_plan_item = bool(
        active_plan and any(
            item.category == "HERBAL"
            for item in active_plan.items
        )
    )

    active_medications = [
        medication
        for medication in profile.medications
        if medication.active
    ]

    if has_herbal_plan_item and active_medications:
        medication_names = ", ".join(
            medication.name
            for medication in active_medications
        )

        insights.append(
            make_insight(
                "herbal-medication-review",
                "SAFETY",
                "Herbal support needs medication review",
                (
                    "The active plan contains herbal support and "
                    f"the member currently has {medication_names} "
                    "recorded. Herbal products should be reviewed "
                    "for relevant medication interactions before use."
                ),
                priority="IMPORTANT",
                evidence=[
                    {
                        "source": "HEALTH_PLAN",
                        "label": "Plan area",
                        "value": "Herbal support",
                    },
                    {
                        "source": "MEDICATION",
                        "label": "Active medication",
                        "value": medication_names,
                    },
                ],
                requires_professional_review=True,
            )
        )

    # -------------------------------------------------
    # SAFETY: allergy context
    # -------------------------------------------------

    if has_herbal_plan_item and profile.allergies:
        allergy_names = ", ".join(
            allergy.allergen
            for allergy in profile.allergies
        )

        insights.append(
            make_insight(
                "herbal-allergy-review",
                "SAFETY",
                "Allergy information should be checked",
                (
                    f"The profile records {allergy_names}. "
                    "Ingredients in herbal and nutrition products "
                    "should be checked against documented allergies."
                ),
                priority="IMPORTANT",
                evidence=[
                    {
                        "source": "ALLERGY",
                        "label": "Recorded allergy",
                        "value": allergy_names,
                    }
                ],
                requires_professional_review=True,
            )
        )

    # -------------------------------------------------
    # PLAN COVERAGE
    # -------------------------------------------------

    if active_plan:
        latest_by_category = {}

        for entry in progress_entries:
            if entry.category not in latest_by_category:
                latest_by_category[entry.category] = entry

        completed = sum(
            1
            for item in active_plan.items
            if (
                item.category in latest_by_category
                and latest_by_category[item.category].completed
            )
        )

        total = len(active_plan.items)

        insights.append(
            make_insight(
                "plan-check-in-coverage",
                "PROGRESS",
                "Whole-health plan check-in",
                (
                    f"{completed} of {total} active plan areas "
                    "currently have a completed check-in."
                ),
                priority="INFO",
                evidence=[
                    {
                        "source": "HEALTH_PLAN",
                        "label": "Active plan",
                        "value": f"Version {active_plan.version}",
                    },
                    {
                        "source": "PROGRESS_ENTRY",
                        "label": "Completed areas",
                        "value": f"{completed} of {total}",
                    },
                ],
            )
        )

    return jsonify({
        "member_id": member_id,
        "generated_from": {
            "health_profile": True,
            "medical_context": True,
            "laboratory_results": bool(lab_results),
            "lifestyle_assessment": bool(
                profile.lifestyle_assessments
            ),
            "active_plan_version": (
                active_plan.version
                if active_plan else None
            ),
            "progress_entries": len(progress_entries),
        },
        "disclaimer": (
            "ROOTED Intelligence organizes member information "
            "to support informed review. It does not diagnose "
            "conditions, prescribe treatment, or replace "
            "qualified healthcare professionals."
        ),
        "insights": insights,
    })

@intelligence_bp.post("/api/members/<int:member_id>/ask")
def ask_rooted(member_id):
    member = User.query.get(member_id)

    if not member:
        return jsonify({"error": "Member not found"}), 404

    profile = HealthProfile.query.filter_by(
        user_id=member_id
    ).first()

    if not profile:
        return jsonify({"error": "Health profile not found"}), 404

    data = request.get_json() or {}
    question = data.get("question", "").strip()

    if not question:
        return jsonify({
            "error": "Question is required"
        }), 400

    question_lower = question.lower()

    active_plan = (
        HealthPlan.query
        .filter_by(
            member_id=member_id,
            status="ACTIVE"
        )
        .order_by(HealthPlan.version.desc())
        .first()
    )

    progress_entries = (
        ProgressEntry.query
        .filter_by(member_id=member_id)
        .order_by(ProgressEntry.recorded_at.desc())
        .all()
    )

    labs = (
        LabResult.query
        .filter_by(health_profile_id=profile.id)
        .order_by(LabResult.id.desc())
        .all()
    )

    latest_by_category = {}

    for entry in progress_entries:
        if entry.category not in latest_by_category:
            latest_by_category[entry.category] = entry

    sources = []
    related_categories = []
    requires_professional_review = False

    # ------------------------------------------
    # PROGRESS / CHANGE
    # ------------------------------------------

    if any(word in question_lower for word in [
        "progress",
        "changed",
        "change",
        "improved",
        "doing",
    ]):
        completed = 0
        total = len(active_plan.items) if active_plan else 0

        if active_plan:
            completed = sum(
                1
                for item in active_plan.items
                if (
                    item.category in latest_by_category
                    and latest_by_category[
                        item.category
                    ].completed
                )
            )

        observations = []

        sleep = latest_by_category.get("SLEEP")

        if sleep and sleep.value is not None:
            observations.append(
                f"your latest sleep check-in is "
                f"{sleep.value:g} hours"
            )

            sources.append({
                "source": "PROGRESS_ENTRY",
                "label": "Sleep",
                "value": f"{sleep.value:g} hours",
            })

        hydration = latest_by_category.get(
            "HYDRATION"
        )

        if hydration and hydration.value is not None:
            observations.append(
                f"your latest hydration check-in is "
                f"{hydration.value:g} cups"
            )

            sources.append({
                "source": "PROGRESS_ENTRY",
                "label": "Hydration",
                "value": f"{hydration.value:g} cups",
            })

        movement = latest_by_category.get(
            "MOVEMENT"
        )

        if movement and movement.value is not None:
            observations.append(
                f"you recorded "
                f"{movement.value:g} movement sessions"
            )

            sources.append({
                "source": "PROGRESS_ENTRY",
                "label": "Movement",
                "value": (
                    f"{movement.value:g} sessions"
                ),
            })

        answer = (
            f"You currently have completed check-ins "
            f"in {completed} of {total} areas of your "
            f"active whole-health plan."
        )

        if observations:
            answer += " Recent records show " + (
                ", ".join(observations)
            ) + "."

        answer += (
            " ROOTED can show these patterns over time "
            "as more check-ins are recorded."
        )

        related_categories = ["PROGRESS"]

    # ------------------------------------------
    # PLAN
    # ------------------------------------------

    elif any(word in question_lower for word in [
        "plan",
        "supposed to",
        "focus",
        "working on",
    ]):
        if not active_plan:
            answer = (
                "There is no active whole-health plan "
                "on this profile."
            )

        else:
            areas = [
                item.category
                .replace("_", " ")
                .title()
                for item in active_plan.items
            ]

            answer = (
                f"Your active ROOTED plan is version "
                f"{active_plan.version} and includes "
                f"{len(areas)} connected areas: "
                f"{', '.join(areas)}."
            )

            if active_plan.review_date:
                answer += (
                    f" It is scheduled for review on "
                    f"{active_plan.review_date.isoformat()}."
                )

            sources.append({
                "source": "HEALTH_PLAN",
                "label": "Active plan",
                "value": (
                    f"Version {active_plan.version}"
                ),
            })

        related_categories = ["PLAN"]

    # ------------------------------------------
    # LABS / TESTING
    # ------------------------------------------

    elif any(word in question_lower for word in [
        "lab",
        "labs",
        "test",
        "testing",
        "vitamin",
        "result",
    ]):
        if not labs:
            answer = (
                "There are no laboratory results "
                "currently stored in your ROOTED profile."
            )

        else:
            lab_descriptions = []

            for lab in labs:
                value = f"{lab.value:g}"

                if lab.unit:
                    value += f" {lab.unit}"

                lab_descriptions.append(
                    f"{lab.test_name}: {value}"
                )

                sources.append({
                    "source": "LAB_RESULT",
                    "label": lab.test_name,
                    "value": value,
                })

            answer = (
                "Your ROOTED profile currently contains "
                + "; ".join(lab_descriptions)
                + ". These results are available for "
                "review with an appropriate healthcare "
                "professional. ROOTED is not interpreting "
                "them as a diagnosis."
            )

            requires_professional_review = True

        related_categories = ["TESTING"]

    # ------------------------------------------
    # HERBS / NATURAL SUPPORT / SAFETY
    # ------------------------------------------

    elif any(word in question_lower for word in [
        "herb",
        "herbal",
        "tea",
        "supplement",
        "natural",
    ]):
        medications = [
            medication
            for medication in profile.medications
            if medication.active
        ]

        allergies = profile.allergies

        answer = (
            "Your active plan includes personalized "
            "herbal support, but ROOTED does not select "
            "a new herb or supplement from this question."
        )

        if medications:
            names = ", ".join(
                medication.name
                for medication in medications
            )

            answer += (
                f" Your profile currently lists {names}, "
                "so relevant medication interactions "
                "should be reviewed before using an "
                "herbal product."
            )

            sources.append({
                "source": "MEDICATION",
                "label": "Active medication",
                "value": names,
            })

        if allergies:
            names = ", ".join(
                allergy.allergen
                for allergy in allergies
            )

            answer += (
                f" Your recorded allergies also include "
                f"{names}, so ingredients should be "
                "checked."
            )

            sources.append({
                "source": "ALLERGY",
                "label": "Recorded allergy",
                "value": names,
            })

        requires_professional_review = True
        related_categories = ["HERBAL", "SAFETY"]

    # ------------------------------------------
    # FALLBACK
    # ------------------------------------------

    else:
        answer = (
            "I can help connect information already in "
            "your ROOTED profile. Try asking about your "
            "progress, active plan, testing, or herbal "
            "safety. I won't diagnose a condition or "
            "create a new treatment from a chat question."
        )

    return jsonify({
        "member_id": member_id,
        "question": question,
        "answer": answer,
        "related_categories": related_categories,
        "requires_professional_review":
            requires_professional_review,
        "sources": sources,
        "boundary": (
            "Ask ROOTED organizes information from the "
            "member's ROOTED record. It does not diagnose "
            "conditions, prescribe treatment, or replace "
            "qualified healthcare professionals."
        ),
    })