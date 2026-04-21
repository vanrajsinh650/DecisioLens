import { DomainConfig } from "@/lib/domains";

export const lendingDomain: DomainConfig = {
    value: "lending",
    label: "Lending",
    description: "Loan and credit decision auditing",
    defaultThreshold: 0.58,
    fields: [
        { key: "name", label: "Applicant Name", type: "text", placeholder: "Arjun Mehta" },
        { key: "income", label: "Annual Income (₹L)", type: "number", min: 1, max: 500 },
        { key: "credit_score", label: "Credit Score", type: "number", min: 300, max: 900 },
        { key: "loan_amount", label: "Loan Amount (₹L)", type: "number", min: 1, max: 200 },
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
        { key: "location", label: "City", type: "text", placeholder: "Pune" },
    ],
    defaultProfile: {
        name: "Arjun Mehta",
        income: 18,
        credit_score: 680,
        loan_amount: 50,
        employment_type: "Salaried",
        gender: "Male",
        location: "Pune",
    },
    variationLabels: {
        baseline: "Original Applicant",
        gender_swap: "Gender Changed",
        location_change: "City Changed",
        employment_change: "Employment Type Changed",
    },
    presets: [
        {
            id: "high-risk-lending",
            title: "High Risk Lending",
            description: "Moderate credit profile with leverage sensitivity.",
            threshold: 0.58,
            profile: {
                name: "Imran Sheikh",
                income: 8,
                credit_score: 610,
                loan_amount: 75,
                employment_type: "Freelancer",
                gender: "Male",
                location: "Delhi",
            },
        },
    ],
};
