"""Quick smoke test for Issues #1, #2, #3, #4 + new fixes."""
from schemas.request import validate_profile
from core.model import compute_score_from_validated
from core.threshold import analyze_threshold_sensitivity, count_local_threshold_switches
from core.analysis import detect_instability, compute_impact_analysis, compute_stability_zone

# ── Issue #1: Verify scorer-consumed fields pass through validation ──
p = validate_profile({
    "name": "Test", "domain": "hiring", "score": 72, "experience": 4,
    "gender": "male", "location": "Bengaluru",
    "education": "bachelor", "interview_score": 65,
})
assert "education" in p, "education field was stripped!"
assert "interview_score" in p, "interview_score field was stripped!"
s1 = compute_score_from_validated(p)

p2 = validate_profile({
    "name": "Test", "domain": "hiring", "score": 72, "experience": 4,
    "gender": "male", "location": "Bengaluru",
    "education": "phd", "interview_score": 95,
})
s2 = compute_score_from_validated(p2)
assert s1 != s2, f"Scores should differ but both are {s1}"
print(f"[PASS] Issue #1: education/interview_score affect score ({s1:.4f} vs {s2:.4f})")

# Welfare domain fields
pw = validate_profile({
    "name": "Test", "domain": "welfare", "annual_income": 2,
    "family_size": 8, "employment_status": "unemployed", "housing_status": "homeless",
})
assert "family_size" in pw, "family_size stripped!"
assert "employment_status" in pw, "employment_status stripped!"
assert "housing_status" in pw, "housing_status stripped!"
sw1 = compute_score_from_validated(pw)

pw2 = validate_profile({
    "name": "Test", "domain": "welfare", "annual_income": 2,
    "family_size": 1, "employment_status": "employed", "housing_status": "owned",
})
sw2 = compute_score_from_validated(pw2)
assert sw1 != sw2, f"Welfare scores should differ but both are {sw1}"
print(f"[PASS] Issue #1: welfare fields affect score ({sw1:.4f} vs {sw2:.4f})")

# ── Issue #4 (NaN/Inf rejection) ──
try:
    validate_profile({"name": "Test", "domain": "hiring", "score": "nan"})
    print("[FAIL] Issue #4: nan was accepted!")
except ValueError as e:
    print(f"[PASS] Issue #4: NaN rejected - {e}")

try:
    validate_profile({"name": "Test", "domain": "hiring", "score": "inf"})
    print("[FAIL] Issue #4: inf was accepted!")
except ValueError as e:
    print(f"[PASS] Issue #4: Inf rejected - {e}")

# ── Issue #2: Local instability ──
threshold_results = analyze_threshold_sensitivity(0.90, user_threshold=0.5)
local_switches = count_local_threshold_switches(threshold_results, user_threshold=0.5)
assert local_switches == 0, f"Expected 0 local switches, got {local_switches}"
print(f"[PASS] Issue #2: Score 0.90 at threshold 0.50 -> local switches: {local_switches}")

threshold_results2 = analyze_threshold_sensitivity(0.52, user_threshold=0.5)
local_switches2 = count_local_threshold_switches(threshold_results2, user_threshold=0.5)
assert local_switches2 == 1, f"Expected 1 local switch, got {local_switches2}"
print(f"[PASS] Issue #2: Score 0.52 at threshold 0.50 -> local switches: {local_switches2}")

# ── Issue #3: Impact analysis with correct threshold ──
impacts = compute_impact_analysis(
    original_score=0.7,
    variation_outcomes={
        "baseline": {"score": 0.7, "decision": "REJECT"},
        "gender_swap": {"score": 0.75, "decision": "REJECT"},
    },
    threshold=0.8,
    original_decision="REJECT",
)
assert not impacts[0]["decision_changed"], "Both REJECT, decision should not change"
print(f"[PASS] Issue #3: Impact analysis uses correct threshold")

# ── Stability zone boundary (half-open intervals) ──
threshold_map = {0.0: "ACCEPT", 0.5: "ACCEPT", 0.6: "REJECT", 1.0: "REJECT"}
zone_data = compute_stability_zone(score=0.55, threshold_results=threshold_map)
zones = zone_data["zones"]
# The ACCEPT zone should end at 0.5 (last ACCEPT threshold), not at 0.6
accept_zone = [z for z in zones if z["label"] == "ACCEPT"][0]
reject_zone = [z for z in zones if z["label"] == "REJECT"][0]
assert accept_zone["end"] == 0.5, f"ACCEPT zone should end at 0.5, got {accept_zone['end']}"
assert reject_zone["start"] == 0.6, f"REJECT zone should start at 0.6, got {reject_zone['start']}"
print(f"[PASS] Stability zone: ACCEPT ends at {accept_zone['end']}, REJECT starts at {reject_zone['start']}")

# ── Fallback recommendation mapping ──
from ai.gemini import _structured_recommendation
assert "human review" in _structured_recommendation("HIGH_RISK").lower()
assert "consider" in _structured_recommendation("BORDERLINE").lower()
assert "routine" in _structured_recommendation("SAFE").lower()
print("[PASS] Fallback recommendation: HIGH_RISK/BORDERLINE/SAFE mapped correctly")

print("\n=== All smoke tests passed! ===")
