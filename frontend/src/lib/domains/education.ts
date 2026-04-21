import { DomainConfig } from "@/lib/domains";

export const educationDomain: DomainConfig = {
    value: "education",
    label: "Education",
    description: "Admissions and scholarship decision auditing",
    defaultThreshold: 0.52,
    fields: [
        { key: "name", label: "Student Name", type: "text", placeholder: "Neha Rao" },
        { key: "score", label: "Entrance Score", type: "number", min: 0, max: 100 },
        { key: "grade_12", label: "Class 12 %", type: "number", min: 0, max: 100 },
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
        { key: "location", label: "City", type: "text", placeholder: "Hyderabad" },
    ],
    defaultProfile: {
        name: "Neha Rao",
        score: 88,
        grade_12: 92,
        income_band: "Middle",
        category: "General",
        gender: "Female",
        location: "Hyderabad",
    },
    variationLabels: {
        baseline: "Original Applicant",
        gender_swap: "Gender Changed",
        location_change: "City Changed",
        category_change: "Category Changed",
    },
    presets: [
        {
            id: "stable-education",
            title: "Stable High Merit",
            description: "Strong applicant profile expected to be robust under minor changes.",
            threshold: 0.52,
            profile: {
                name: "Ananya Gupta",
                score: 90,
                grade_12: 94,
                income_band: "Middle",
                category: "General",
                gender: "Female",
                location: "Bengaluru",
            },
        },
    ],
};
