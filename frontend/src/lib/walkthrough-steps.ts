import { WalkthroughStep } from "@/components/shared/Walkthrough";

export const AUDIT_WALKTHROUGH_STEPS: WalkthroughStep[] = [
    {
        targetId: "domain-selector",
        title: "Step 1: Choose a Domain",
        body: "Pick the type of AI system you want to audit — Hiring, Lending, Education, or your own Custom schema.",
        position: "bottom",
    },
    {
        targetId: "profile-fields",
        title: "Step 2: Enter a Profile",
        body: "Fill in the profile details exactly as they are passed to your AI system.",
        position: "right",
    },
    {
        targetId: "threshold-control",
        title: "Step 3: Set the Decision Threshold",
        body: "Adjust the threshold to test how sensitive the model decision is to small shifts.",
        position: "top",
    },
    {
        targetId: "btn-submit-audit",
        title: "Step 4: Run the Audit",
        body: "Run the audit to evaluate trust stability, fairness signals, and explainability output.",
        position: "top",
    },
];
