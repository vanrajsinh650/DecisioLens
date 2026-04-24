import { WalkthroughStep } from "@/components/shared/Walkthrough";

export const AUDIT_WALKTHROUGH_STEPS: WalkthroughStep[] = [
    {
        targetId: "domain-selector",
        title: "Step 1: Choose a Domain",
        body: "Pick the type of AI decision you want to test: Hiring, Lending, Education, Insurance, Welfare, or your own custom setup.",
        position: "bottom",
    },
    {
        targetId: "profile-fields",
        title: "Step 2: Enter a Profile",
        body: "Fill in the details for the person being tested. Use real values if you can, or try one of the built-in presets.",
        position: "right",
    },
    {
        targetId: "threshold-control",
        title: "Step 3: Set the Threshold",
        body: "The threshold decides how strict the AI is. Lower means easier to pass. Try 0.50 if you're not sure.",
        position: "top",
    },
    {
        targetId: "btn-submit-audit",
        title: "Step 4: Run the Test",
        body: "Hit run and we'll test stability, swap demographic details, and show you whether the outcome changes.",
        position: "top",
    },
];
