from __future__ import annotations

from typing import Any, Mapping, Sequence

from core.threshold import Decision


VALID_DECISIONS: set[str] = {"ACCEPT", "REJECT"}
SUSPICIOUS_SCORE_DELTA: float = 0.05


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
) -> dict[str, Any]:
    """
    Detect instability from variation outcomes and threshold sensitivity.
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

    normalized_thresholds = _normalize_threshold_results(threshold_results)
    threshold_switch_points: list[float] = []
    previous_decision: Decision | None = None
    for threshold, decision in normalized_thresholds:
        if previous_decision is not None and decision != previous_decision:
            threshold_switch_points.append(threshold)
        previous_decision = decision

    variation_flip_count = len(decision_flips)
    threshold_switch_count = len(threshold_switch_points)
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
        "threshold_switch_points": threshold_switch_points,
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
