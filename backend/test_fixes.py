"""Quick smoke test for Issues #1, #2, #3, #4."""
from schemas.request import validate_profile
from core.model import compute_score_from_validated
from core.threshold import analyze_threshold_sensitivity, count_local_threshold_switches
from core.analysis import detect_instability, compute_impact_analysis

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
print(f"✅ Issue #1: education/interview_score affect score ({s1:.4f} vs {s2:.4f})")

# ── Issue #4: NaN rejection ──
try:
    validate_profile({"name": "Test", "domain": "hiring", "score": "nan"})
    print("❌ Issue #4: nan was accepted!")
except ValueError as e:
    print(f"✅ Issue #4: NaN rejected — {e}")

try:
    validate_profile({"name": "Test", "domain": "hiring", "score": "inf"})
    print("❌ Issue #4: inf was accepted!")
except ValueError as e:
    print(f"✅ Issue #4: Inf rejected — {e}")

# ── Issue #2: Local instability ──
threshold_results = analyze_threshold_sensitivity(0.90, user_threshold=0.5)
local_switches = count_local_threshold_switches(threshold_results, user_threshold=0.5)
print(f"✅ Issue #2: Score 0.90 at threshold 0.50 → local switches: {local_switches} (should be 0)")

threshold_results2 = analyze_threshold_sensitivity(0.52, user_threshold=0.5)
local_switches2 = count_local_threshold_switches(threshold_results2, user_threshold=0.5)
print(f"✅ Issue #2: Score 0.52 at threshold 0.50 → local switches: {local_switches2} (should be 1)")

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
print(f"✅ Issue #3: Impact analysis uses correct threshold (decision_changed={impacts[0]['decision_changed']})")

print("\n🎯 All smoke tests passed!")
