import { DomainConfig } from "@/lib/domains";

export const educationDomain: DomainConfig = {
    value: "education",
    label: "Education",
    description: "Admissions and scholarship decision auditing",
    defaultThreshold: 0.52,
    fields: [
        { key: "name", label: "Student Name", type: "text", placeholder: "Enter student name" },
        { key: "score", label: "Entrance Score", type: "number", min: 0, max: 100, placeholder: "e.g. 92 (0-100)" },
        { key: "grade_12", label: "Class 12 %", type: "number", min: 0, max: 100, placeholder: "e.g. 88" },
        { key: "extracurricular", label: "Extracurricular Score", type: "number", min: 0, max: 10, placeholder: "e.g. 7 (0-10)" },
        {
            key: "college",
            label: "College Tier",
            type: "select",
            options: ["Tier 1", "Tier 2", "Tier 3"],
        },
        {
            key: "income_band",
            label: "Family Income Band",
            type: "select",
            options: ["Low", "Middle", "High"],
        },
        {
            key: "category",
            label: "Applicant Category",
            type: "select",
            options: ["General", "OBC", "SC", "ST", "EWS"],
        },
        {
            key: "gender",
            label: "Gender",
            type: "select",
            options: ["Female", "Male", "Other"],
        },
        { key: "location", label: "City", type: "text", placeholder: "Enter city" },
    ],
    defaultProfile: {
        name: "",
        score: "",
        grade_12: "",
        extracurricular: "",
        college: "",
        income_band: "",
        category: "",
        gender: "",
        location: "",
    },
    variationLabels: {
        baseline: "Original Applicant",
        gender_swap: "Gender Changed",
        location_change: "City Changed",
        category_change: "Category Changed",
    },
    presets: [],
};
