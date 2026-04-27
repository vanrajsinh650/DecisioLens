import { DomainConfig } from "@/lib/domains";

export const hiringDomain: DomainConfig = {
    value: "hiring",
    label: "Hiring",
    description: "Candidate screening and recruitment decision auditing",
    defaultThreshold: 0.5,
    fields: [
        { key: "name", label: "Candidate Name", type: "text", placeholder: "Enter candidate name" },
        { key: "score", label: "Skills Score", type: "number", min: 0, max: 100, placeholder: "e.g. 85 (0-100)" },
        { key: "experience", label: "Years of Experience", type: "number", min: 0, max: 50, placeholder: "e.g. 4" },
        { key: "interview_score", label: "Interview Score", type: "number", min: 0, max: 100, placeholder: "e.g. 78 (0-100)" },
        {
            key: "gender",
            label: "Gender",
            type: "select",
            options: ["Female", "Male", "Non-binary", "Prefer not to say"],
        },
        { key: "location", label: "Location", type: "text", placeholder: "Enter location" },
        {
            key: "college",
            label: "College Tier",
            type: "select",
            options: ["Tier 1", "Tier 2", "Tier 3"],
        },
    ],
    defaultProfile: {
        name: "",
        score: "",
        experience: "",
        interview_score: "",
        gender: "",
        location: "",
        college: "",
    },
    variationLabels: {
        baseline: "Original Candidate",
        gender_swap: "Gender Swapped",
        location_change: "Location Changed",
        college_change: "College Tier Changed",
    },
    presets: [],
};
