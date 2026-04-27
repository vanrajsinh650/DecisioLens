import { DomainConfig } from "@/lib/domains";

export const hiringDomain: DomainConfig = {
    value: "hiring",
    label: "Hiring",
    description: "Candidate screening and recruitment decision auditing",
    defaultThreshold: 0.5,
    fields: [
        { key: "name", label: "Candidate Name", type: "text", placeholder: "Alex Kumar" },
        { key: "score", label: "Skills Score", type: "number", min: 0, max: 100 },
        { key: "experience", label: "Years of Experience", type: "number", min: 0, max: 50 },
        { key: "interview_score", label: "Interview Score", type: "number", min: 0, max: 100 },
        {
            key: "gender",
            label: "Gender",
            type: "select",
            options: ["Female", "Male", "Non-binary", "Prefer not to say"],
        },
        { key: "location", label: "Location", type: "text", placeholder: "Bengaluru" },
        {
            key: "college",
            label: "College Tier",
            type: "select",
            options: ["Tier 1", "Tier 2", "Tier 3"],
        },
    ],
    defaultProfile: {
        name: "Alex Kumar",
        score: 72,
        experience: 4,
        interview_score: 65,
        gender: "Male",
        location: "Bengaluru",
        college: "Tier 1",
    },
    variationLabels: {
        baseline: "Original Candidate",
        gender_swap: "Gender Swapped",
        location_change: "Location Changed",
        college_change: "College Tier Changed",
    },
    presets: [
        {
            id: "borderline-hiring",
            title: "Borderline Hiring Case",
            description: "Near-boundary score where small threshold shifts may flip the decision.",
            threshold: 0.5,
            profile: {
                name: "Riya Shah",
                score: 66,
                experience: 3,
                interview_score: 60,
                gender: "Female",
                location: "Mumbai",
                college: "Tier 1",
            },
        },
    ],
};

