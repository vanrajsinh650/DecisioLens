from __future__ import annotations

from typing import Any, Mapping, Sequence

from core.threshold import Decision, count_local_threshold_switches


VALID_DECISIONS: set[str] = {"ACCEPT", "REJECT"}
SUSPICIOUS_SCORE_DELTA: float = 0.05
HIGH_CONFIDENCE_DISTANCE: float = 0.2
BORDERLINE_DISTANCE: float = 0.1


def _normalize_decision(value: Any, context: str) -> Decision:
    if not isinstance(value, str):
        raise ValueError(f"{context} must be a decision string")

    decision = value.strip().upper()
    if decision not in VALID_DECISIONS:
        raise ValueError(f"{context} must be ACCEPT or REJECT")

    return decision  # type: ignore[return-value]


def _normalize_score(value: Any, context: str) -> float:
    try:
        score = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{context} must be numeric") from exc

    if not 0.0 <= score <= 1.0:
        raise ValueError(f"{context} must be between 0 and 1")
    return score


def _normalize_variation_outcomes(
    variations: Mapping[str, Any] | Sequence[Mapping[str, Any]],
) -> dict[str, Mapping[str, Any]]:
    if isinstance(variations, Mapping):
        normalized: dict[str, Mapping[str, Any]] = {}
        for name, outcome in variations.items():
            if not isinstance(name, str) or not name.strip():
                raise ValueError("variation name must be a non-empty string")
            if not isinstance(outcome, Mapping):
                raise ValueError("variation outcome must be a mapping")
            normalized[name] = outcome
        return normalized

    normalized = {}
    for item in variations:
        if not isinstance(item, Mapping):
            raise ValueError("variation outcome must be a mapping")
        name = item.get("variation")
        if not isinstance(name, str) or not name.strip():
            raise ValueError("variation outcome must include variation name")
        normalized[name] = item
    return normalized


def _normalize_threshold_results(
    threshold_results: Mapping[Any, Any],
) -> list[tuple[float, Decision]]:
    normalized: list[tuple[float, Decision]] = []
    for threshold, decision in threshold_results.items():
        try:
            numeric_threshold = float(threshold)
        except (TypeError, ValueError) as exc:
            raise ValueError("threshold_results keys must be numeric") from exc

        if not 0.0 <= numeric_threshold <= 1.0:
            raise ValueError("threshold values must be between 0 and 1")

        normalized.append(
            (
                numeric_threshold,
                _normalize_decision(decision, "threshold_results value"),
            )
        )

    normalized.sort(key=lambda item: item[0])
    return normalized


def detect_instability(
    original: Mapping[str, Any],
    variations: Mapping[str, Any] | Sequence[Mapping[str, Any]],
    threshold_results: Mapping[Any, Any],
    user_threshold: float = 0.5,
) -> dict[str, Any]:
    """
    Detect instability from variation outcomes and threshold sensitivity.

    threshold_switch_count only considers switches within a local
    neighborhood (±0.10) of user_threshold, preventing the global sweep
    from flagging nearly every non-extreme score as unstable.
    """

    original_decision = _normalize_decision(
        original.get("decision"), "original.decision"
    )
    original_score = _normalize_score(original.get("score"), "original.score")

    variation_outcomes = _normalize_variation_outcomes(variations)
    decision_flips: list[dict[str, Any]] = []
    for name, outcome in variation_outcomes.items():
        variation_decision = _normalize_decision(
            outcome.get("decision"), f"{name}.decision"
        )
        variation_score = _normalize_score(outcome.get("score"), f"{name}.score")
        flipped = variation_decision != original_decision
        if flipped:
            decision_flips.append(
                {
                    "variation": name,
                    "from": original_decision,
                    "to": variation_decision,
                    "score_delta": round(variation_score - original_score, 6),
                }
            )

    # Use local neighborhood switches instead of the full global sweep
    normalized_thresholds = _normalize_threshold_results(threshold_results)
    threshold_dict: dict[float, Decision] = {t: d for t, d in normalized_thresholds}
    threshold_switch_count = count_local_threshold_switches(
        threshold_dict, user_threshold
    )

    # Also compute global switch points for the stability zone visualization
    global_switch_points: list[float] = []
    previous_decision: Decision | None = None
    for threshold, decision in normalized_thresholds:
        if previous_decision is not None and decision != previous_decision:
            global_switch_points.append(threshold)
        previous_decision = decision

    variation_flip_count = len(decision_flips)
    is_unstable = variation_flip_count > 0 or threshold_switch_count > 0

    if variation_flip_count >= 2 or threshold_switch_count >= 2:
        sensitivity = "HIGH"
    elif variation_flip_count == 1 or threshold_switch_count == 1:
        sensitivity = "MEDIUM"
    else:
        sensitivity = "LOW"

    return {
        "is_unstable": is_unstable,
        "sensitivity": sensitivity,
        "variation_flip_count": variation_flip_count,
        "threshold_switch_count": threshold_switch_count,
        "decision_flips": decision_flips,
        "threshold_switch_points": global_switch_points,
    }


def detect_bias_patterns(
    original: Mapping[str, Any],
    variations: Mapping[str, Any] | Sequence[Mapping[str, Any]],
) -> dict[str, Any]:
    """
    Compare counterfactual outcomes and flag suspicious differences.
    """

    original_decision = _normalize_decision(
        original.get("decision"), "original.decision"
    )
    original_score = _normalize_score(original.get("score"), "original.score")

    variation_outcomes = _normalize_variation_outcomes(variations)
    suspicious_patterns: list[dict[str, Any]] = []
    compared: list[dict[str, Any]] = []

    for name, outcome in variation_outcomes.items():
        if name == "baseline":
            continue

        variation_decision = _normalize_decision(
            outcome.get("decision"), f"{name}.decision"
        )
        variation_score = _normalize_score(outcome.get("score"), f"{name}.score")
        score_delta = round(variation_score - original_score, 6)
        decision_changed = variation_decision != original_decision
        suspicious = decision_changed or abs(score_delta) >= SUSPICIOUS_SCORE_DELTA

        row = {
            "variation": name,
            "decision_changed": decision_changed,
            "score_delta": score_delta,
            "is_suspicious": suspicious,
        }
        compared.append(row)
        if suspicious:
            suspicious_patterns.append(row)

    return {
        "has_bias_flags": len(suspicious_patterns) > 0,
        "flag_count": len(suspicious_patterns),
        "suspicious_patterns": suspicious_patterns,
        "compared_variations": compared,
    }


def classify_confidence(score: Any, threshold: float = 0.5) -> str:
    """
    Classify confidence zone from score distance to the active decision
    threshold (not the neutral midpoint).

    Parameters
    ----------
    score : numeric
        The raw probability score in [0, 1].
    threshold : float
        The decision boundary actually used for ACCEPT/REJECT.
    """

    normalized_score = _normalize_score(score, "score")
    if not 0.0 <= threshold <= 1.0:
        raise ValueError("threshold must be between 0 and 1")

    distance_to_boundary = abs(normalized_score - threshold)

    if distance_to_boundary >= HIGH_CONFIDENCE_DISTANCE:
        return "High confidence"
    if distance_to_boundary >= BORDERLINE_DISTANCE:
        return "Borderline"
    return "Unstable"


def compute_risk_score(instability: Any, bias_detected: bool) -> dict[str, Any]:
    """
    Compute a normalized 0-100 risk score with 3-tier lab labels.

    Bands:
    - 0–30:  SAFE      🟢
    - 31–60: BORDERLINE 🟡
    - 61–100: HIGH_RISK  🔴

    Also emits a ``reasons`` list so the UI can show *why*.
    """

    instability_report: Mapping[str, Any]
    if isinstance(instability, Mapping):
        instability_report = instability
    else:
        instability_report = {"is_unstable": bool(instability)}

    sensitivity = str(instability_report.get("sensitivity", "")).upper()
    is_unstable = bool(instability_report.get("is_unstable"))
    variation_flip_count = int(instability_report.get("variation_flip_count", 0))
    threshold_switch_count = int(instability_report.get("threshold_switch_count", 0))

    if sensitivity == "HIGH":
        instability_points = 55
    elif sensitivity == "MEDIUM":
        instability_points = 40
    elif is_unstable:
        instability_points = 25
    else:
        instability_points = 10

    structural_points = min((variation_flip_count + threshold_switch_count) * 5, 20)
    bias_points = 35 if bias_detected else 0

    score = max(0, min(instability_points + structural_points + bias_points, 100))

    if score <= 30:
        level = "SAFE"
    elif score <= 60:
        level = "BORDERLINE"
    else:
        level = "HIGH_RISK"

    # Build human-readable reasons
    reasons: list[str] = []
    if bias_detected:
        flag_count = int(instability_report.get("variation_flip_count", 0))
        reasons.append("decision changes with demographic or profile variations")
    if threshold_switch_count > 0:
        reasons.append("result flips at nearby decision levels")
    if variation_flip_count > 0:
        reasons.append("small profile changes can flip the outcome")
    if sensitivity == "HIGH":
        reasons.append("high overall sensitivity detected")
    if not reasons:
        reasons.append("no significant risk factors detected")

    return {"score": score, "level": level, "reasons": reasons}


# ── Stability zone (Feature #1) ─────────────────────────────────────

def compute_stability_zone(
    score: float,
    threshold_results: Mapping[float, str],
) -> dict[str, Any]:
    """
    Convert threshold-sweep results into labelled ACCEPT / UNSTABLE / REJECT
    range bands.

    The *unstable zone* is the range of thresholds around the transition
    point where the decision switches.  If there is no switch point (score
    is always ACCEPT or always REJECT), the unstable zone is empty.

    Returns
    -------
    dict with keys:
        zones   – list of {start, end, label} range bands
        summary – one-line human-readable sentence
    """
    sorted_items = sorted(threshold_results.items(), key=lambda kv: kv[0])

    if not sorted_items:
        return {
            "zones": [],
            "summary": "No threshold data available.",
        }

    # Detect transition boundaries — half-open intervals [start, end)
    # The flip threshold belongs to the NEW zone, not the old one.
    zones: list[dict[str, Any]] = []
    current_label = sorted_items[0][1]
    current_start = sorted_items[0][0]
    prev_threshold = current_start

    for threshold, decision in sorted_items[1:]:
        if decision != current_label:
            # Previous zone ends just before this threshold
            zones.append({
                "start": round(current_start, 4),
                "end": round(prev_threshold, 4),
                "label": current_label,
            })
            current_start = threshold
            current_label = decision
        prev_threshold = threshold

    # Close the last zone
    zones.append({
        "start": round(current_start, 4),
        "end": round(sorted_items[-1][0], 4),
        "label": current_label,
    })

    # Build summary
    accept_zones = [z for z in zones if z["label"] == "ACCEPT"]
    reject_zones = [z for z in zones if z["label"] == "REJECT"]

    if not reject_zones:
        summary = "Result stays ACCEPT across all decision levels — very stable."
    elif not accept_zones:
        summary = "Result stays REJECT across all decision levels — very stable."
    else:
        flip_point = reject_zones[0]["start"]
        summary = (
            f"Result is ACCEPT below {flip_point:.2f} and REJECT at or above — "
            f"the decision flips near {flip_point:.2f}."
        )

    return {"zones": zones, "summary": summary}


# ── Impact analysis (Feature #4) ────────────────────────────────────

def compute_impact_analysis(
    original_score: float,
    variation_outcomes: Mapping[str, Mapping[str, Any]],
    threshold: float = 0.5,
    original_decision: str | None = None,
) -> list[dict[str, Any]]:
    """
    Calculate per-variable score deltas sorted by highest absolute impact.

    Uses the active request threshold and original decision so that
    near-threshold audits produce correct impact narratives.

    Each entry shows how much the score changed when a single variable
    was modified (counterfactual test).

    Returns
    -------
    list of {variable, delta, direction, decision_changed}
    """
    impacts: list[dict[str, Any]] = []

    # Derive the original decision from the actual threshold if not provided
    if original_decision is None:
        original_decision = "ACCEPT" if original_score >= threshold else "REJECT"

    _LABEL_MAP = {
        "gender_swap": "Gender",
        "location_change": "Location",
        "college_change": "College / Education tier",
        "employment_change": "Employment type",
        "category_change": "Social category",
        "age_change": "Age group",
        "income_change": "Income level",
        "score_bump": "Qualification score",
    }

    for name, outcome in variation_outcomes.items():
        if name == "baseline":
            continue

        variation_score = float(outcome.get("score", original_score))
        delta = round(variation_score - original_score, 6)

        if delta == 0.0:
            continue

        variation_decision = outcome.get("decision", "REJECT")
        decision_changed = str(variation_decision) != str(original_decision)

        impacts.append({
            "variable": _LABEL_MAP.get(name, name.replace("_", " ").title()),
            "delta": delta,
            "direction": "positive" if delta > 0 else "negative",
            "decision_changed": decision_changed,
        })

    # Sort by absolute impact, largest first
    impacts.sort(key=lambda x: abs(x["delta"]), reverse=True)

    if not impacts:
        impacts.append({
            "variable": "All tested variables",
            "delta": 0.0,
            "direction": "none",
            "decision_changed": False,
        })

    return impacts


def build_reason_tags(
    *,
    instability_report: Mapping[str, Any],
    bias_report: Mapping[str, Any],
    confidence_zone: str,
) -> list[str]:
    """
    Build concise reason tags to simplify judge review and UI rendering.
    """

    tags: list[str] = []

    if int(instability_report.get("threshold_switch_count", 0)) > 0:
        tags.append("threshold_sensitive")
    if int(instability_report.get("variation_flip_count", 0)) > 0:
        tags.append("profile_instability")

    suspicious_patterns = bias_report.get("suspicious_patterns", [])
    if isinstance(suspicious_patterns, Sequence):
        for row in suspicious_patterns:
            if not isinstance(row, Mapping):
                continue
            variation = row.get("variation")
            if variation == "location_change":
                tags.append("location_sensitive")
            elif variation == "gender_swap":
                tags.append("demographic_sensitive")
            elif variation == "college_change":
                tags.append("education_sensitive")

    if bool(bias_report.get("has_bias_flags")):
        tags.append("bias_detected")
    if confidence_zone == "Borderline":
        tags.append("threshold_sensitive")
    elif confidence_zone == "Unstable":
        tags.append("score_instability")

    # Preserve first-seen ordering while removing duplicates.
    return list(dict.fromkeys(tags))


def compute_recourse_suggestions(
    *,
    original_score: float,
    original_decision: str,
    threshold: float,
    instability_report: Mapping[str, Any],
    bias_report: Mapping[str, Any],
) -> list[dict[str, str]]:
    """
    Generate actionable recourse suggestions: concrete changes that would
    flip a REJECT decision to ACCEPT.

    Returns a list of {"action": str, "impact": str} dicts.
    """
    suggestions: list[dict[str, str]] = []

    if original_decision == "ACCEPT":
        return suggestions  # No recourse needed

    gap = threshold - original_score  # How far the score is below threshold

    # 1. Threshold-based recourse
    for flip_threshold in instability_report.get("threshold_switch_points", []):
        if float(flip_threshold) < threshold:
            suggestions.append({
                "action": f"Request a lower decision threshold (currently {threshold:.2f}, accepted at {float(flip_threshold):.2f})",
                "impact": "Would flip outcome to ACCEPT at the indicated threshold",
            })
            break

    # 2. Score-based recourse
    if gap > 0:
        pct = round(gap * 100, 1)
        suggestions.append({
            "action": f"Improve the primary qualification score by {pct} points",
            "impact": f"A score increase of {pct}% would meet the current threshold of {threshold:.2f}",
        })

    # 3. Demographic-based recourse (flags only, no prescriptive bias)
    suspicious_patterns = bias_report.get("suspicious_patterns", [])
    for pattern in suspicious_patterns:
        if not isinstance(pattern, Mapping):
            continue
        variation = str(pattern.get("variation", ""))
        delta = float(pattern.get("score_delta", 0))
        if delta > 0 and pattern.get("decision_changed"):
            field_map = {
                "gender_swap": "gender classification",
                "location_change": "location or city tier",
                "college_change": "college or education tier",
                "employment_change": "employment category",
                "category_change": "social category classification",
                "age_change": "age group",
            }
            field = field_map.get(variation, variation.replace("_", " "))
            suggestions.append({
                "action": f"Request review of how {field} was factored into this decision",
                "impact": f"Changing this variable improved the simulated score by {round(delta * 100, 1)}% and flipped the outcome",
            })

    # 4. Human review as recourse
    if bool(instability_report.get("is_unstable")) or bool(bias_report.get("has_bias_flags")):
        suggestions.append({
            "action": "Request a manual review by a human decision-maker",
            "impact": "Automated decision shows instability or bias indicators — human oversight is warranted",
        })

    return suggestions[:5]  # Cap at 5 so the UI stays readable


def compute_human_review_recommendation(
    *,
    risk_score: int,
    instability_report: Mapping[str, Any],
    bias_report: Mapping[str, Any],
    confidence_zone: str,
) -> dict[str, str]:
    """
    Determine whether human review is Required, Recommended, or Not Required.

    Trigger conditions:
    - REQUIRED: risk_score > 70, OR bias detected, OR confidence == Unstable
    - RECOMMENDED: risk_score > 35, OR any threshold flips, OR any variation flips
    - NOT_REQUIRED: otherwise
    """
    bias_detected = bool(bias_report.get("has_bias_flags"))
    is_unstable = bool(instability_report.get("is_unstable"))

    if risk_score > 70 or bias_detected or confidence_zone == "Unstable":
        level = "REQUIRED"
        reason = (
            "This decision has a high risk score, detected bias indicators, or sits "
            "in an unstable confidence zone. A human reviewer should assess this before "
            "the outcome is finalized."
        )
    elif risk_score > 35 or is_unstable:
        level = "RECOMMENDED"
        reason = (
            "The decision shows moderate instability or sensitivity. A human review "
            "is not mandatory but would improve confidence in the outcome."
        )
    else:
        level = "NOT_REQUIRED"
        reason = (
            "The decision is stable across threshold and variation testing. "
            "Automated processing can proceed with standard audit logging."
        )

    return {"level": level, "reason": reason}

