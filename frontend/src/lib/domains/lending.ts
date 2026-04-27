import { DomainConfig } from "@/lib/domains";

export const lendingDomain: DomainConfig = {
    value: "lending",
    label: "Lending",
    description: "Loan and credit decision auditing",
    defaultThreshold: 0.58,
    fields: [
        { key: "name", label: "Applicant Name", type: "text", placeholder: "Enter applicant name" },
        { key: "income", label: "Annual Income (₹)", type: "number", min: 0, placeholder: "e.g. 80000" },
        { key: "credit_score", label: "Credit Score", type: "number", min: 300, max: 900 },
        { key: "loan_amount", label: "Loan Amount (₹)", type: "number", min: 1, placeholder: "e.g. 250000" },
        { key: "employment_years", label: "Employment Years", type: "number", min: 0, max: 50 },
        {
            key: "employment_type",
            label: "Employment Type",
            type: "select",
            options: ["Salaried", "Self-Employed", "Freelancer"],
        },
        {
            key: "gender",
            label: "Gender",
            type: "select",
            options: ["Male", "Female", "Other"],
        },
        { key: "location", label: "City", type: "text", placeholder: "Enter city" },
    ],
    defaultProfile: {
        name: "",
        income: "",
        credit_score: "",
        loan_amount: "",
        employment_years: "",
        employment_type: "",
        gender: "",
        location: "",
    },
    variationLabels: {
        baseline: "Original Applicant",
        gender_swap: "Gender Changed",
        location_change: "City Changed",
        employment_change: "Employment Type Changed",
    },
    presets: [],
};
