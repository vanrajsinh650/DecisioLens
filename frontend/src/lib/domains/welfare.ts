import { DomainConfig } from "@/lib/domains";

export const welfareDomain: DomainConfig = {
    value: "welfare",
    label: "Govt. Welfare",
    description: "Government scheme eligibility and benefit disbursement simulation",
    defaultThreshold: 0.48,
    fields: [
        { key: "name", label: "Applicant Name", type: "text", placeholder: "Enter applicant name" },
        {
            key: "category",
            label: "Social Category",
            type: "select",
            options: ["General", "OBC", "SC", "ST", "EWS"],
        },
        {
            key: "gender",
            label: "Gender",
            type: "select",
            options: ["Female", "Male", "Other"],
        },
        {
            key: "state_tier",
            label: "State / Region",
            type: "select",
            options: ["Metro State", "Developed State", "Developing State", "Remote Region"],
        },
        { key: "annual_income", label: "Annual Income (₹)", type: "number", min: 0, placeholder: "e.g. 80000" },
        { key: "family_size", label: "Family Size", type: "number", min: 1, max: 20, placeholder: "e.g. 4" },
        { key: "land_holding", label: "Land Holding (acres)", type: "number", min: 0, max: 20, placeholder: "e.g. 2" },
        {
            key: "employment_status",
            label: "Employment Status",
            type: "select",
            options: ["Employed", "Self-employed", "Daily Wage", "Unemployed"],
        },
        {
            key: "housing_status",
            label: "Housing Status",
            type: "select",
            options: ["Owns Home", "Renting", "Homeless"],
        },
        {
            key: "aadhaar_linked",
            label: "Aadhaar Linked",
            type: "select",
            options: ["Yes", "No"],
        },
    ],
    defaultProfile: {
        name: "",
        category: "",
        gender: "",
        state_tier: "",
        annual_income: "",
        family_size: "",
        land_holding: "",
        employment_status: "",
        housing_status: "",
        aadhaar_linked: "",
    },
    variationLabels: {
        baseline: "Original Applicant",
        gender_swap: "Gender Changed",
        location_change: "Region Changed",
        category_change: "Category Changed",
    },
    presets: [],
};
