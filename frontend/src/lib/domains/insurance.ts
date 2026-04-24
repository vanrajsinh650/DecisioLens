import { DomainConfig } from "@/lib/domains";

export const insuranceDomain: DomainConfig = {
    value: "insurance",
    label: "Health Insurance",
    description: "Health insurance claim approval and rejection simulation",
    defaultThreshold: 0.52,
    fields: [
        { key: "name", label: "Applicant Name", type: "text", placeholder: "Sunita Verma" },
        { key: "age", label: "Age", type: "number", min: 18, max: 90 },
        {
            key: "gender",
            label: "Gender",
            type: "select",
            options: ["Female", "Male", "Other"],
        },
        {
            key: "city_tier",
            label: "City Tier",
            type: "select",
            options: ["Tier 1", "Tier 2", "Tier 3"],
        },
        {
            key: "pre_existing",
            label: "Pre-existing Condition",
            type: "select",
            options: ["None", "Diabetes", "Hypertension", "Both"],
        },
        { key: "claim_amount", label: "Claim Amount (₹L)", type: "number", min: 1, max: 50 },
        { key: "policy_tenure", label: "Policy Tenure (years)", type: "number", min: 0, max: 30 },
    ],
    defaultProfile: {
        name: "Sunita Verma",
        age: 54,
        gender: "Female",
        city_tier: "Tier 2",
        pre_existing: "Diabetes",
        claim_amount: 4,
        policy_tenure: 3,
    },
    variationLabels: {
        baseline: "Original Applicant",
        gender_swap: "Gender Changed",
        location_change: "City Tier Changed",
        age_change: "Age Group Changed",
    },
    presets: [
        {
            id: "senior-claim-rejection",
            title: "Senior Citizen Claim",
            description: "Older patient with a pre-existing condition sitting near the approval cutoff. Tests whether age and health history affect the outcome.",
            threshold: 0.52,
            profile: {
                name: "Ramesh Sharma",
                age: 67,
                gender: "Male",
                city_tier: "Tier 3",
                pre_existing: "Hypertension",
                claim_amount: 6,
                policy_tenure: 2,
            },
        },
        {
            id: "young-claim-stable",
            title: "Young Urban Applicant",
            description: "Younger metro applicant with no pre-existing conditions. Useful as a clean baseline to compare against higher-risk profiles.",
            threshold: 0.52,
            profile: {
                name: "Priya Iyer",
                age: 30,
                gender: "Female",
                city_tier: "Tier 1",
                pre_existing: "None",
                claim_amount: 2,
                policy_tenure: 5,
            },
        },
    ],
};
