import { DomainConfig } from "@/lib/domains";

export const insuranceDomain: DomainConfig = {
    value: "insurance",
    label: "Health Insurance",
    description: "Health insurance claim approval and rejection simulation",
    defaultThreshold: 0.52,
    fields: [
        { key: "name", label: "Applicant Name", type: "text", placeholder: "Enter applicant name" },
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
        { key: "claim_amount", label: "Claim Amount (₹)", type: "number", min: 0, placeholder: "e.g. 50000" },
        { key: "coverage_amount", label: "Coverage Amount (₹)", type: "number", min: 0, placeholder: "e.g. 500000" },
        { key: "policy_tenure", label: "Policy Tenure (years)", type: "number", min: 0, max: 30 },
    ],
    defaultProfile: {
        name: "",
        age: "",
        gender: "",
        city_tier: "",
        pre_existing: "",
        claim_amount: "",
        coverage_amount: "",
        policy_tenure: "",
    },
    variationLabels: {
        baseline: "Original Applicant",
        gender_swap: "Gender Changed",
        location_change: "City Tier Changed",
        age_change: "Age Group Changed",
    },
    presets: [],
};
