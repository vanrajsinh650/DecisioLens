import { DomainConfig, DomainFieldConfig } from "@/lib/domains";

export const CUSTOM_DOMAIN_CONFIG_KEY = "decisiolens:custom-domain-config";

export const defaultCustomFields: DomainFieldConfig[] = [
    { key: "name", label: "Profile Name", type: "text", placeholder: "Case A" },
    { key: "score", label: "Model Score", type: "number", min: 0, max: 100 },
    { key: "group", label: "Group", type: "text", placeholder: "Group 1" },
];

export const defaultCustomDomain: DomainConfig = {
    value: "custom",
    label: "✏️ Custom",
    description: "Build your own profile schema for any AI system",
    defaultThreshold: 0.5,
    fields: defaultCustomFields,
    defaultProfile: {
        name: "Case A",
        score: 50,
        group: "Group 1",
    },
    variationLabels: {
        baseline: "Original Profile",
    },
    presets: [],
};

function buildDefaultProfile(fields: DomainFieldConfig[]): Record<string, string | number> {
    return fields.reduce<Record<string, string | number>>((profile, field) => {
        if (field.type === "number") {
            profile[field.key] = Number.isFinite(field.min) ? (field.min as number) : 0;
            return profile;
        }

        if (field.type === "select") {
            profile[field.key] = field.options?.[0] ?? "";
            return profile;
        }

        profile[field.key] = field.placeholder ?? "";
        return profile;
    }, {});
}

export function sanitizeCustomFields(input: unknown): DomainFieldConfig[] {
    if (!Array.isArray(input)) {
        return defaultCustomFields;
    }

    const normalized = input
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item, index) => {
            const type = item.type;
            const normalizedType =
                type === "number" || type === "select" || type === "text" ? type : "text";
            const keySource = typeof item.key === "string" && item.key.trim() ? item.key.trim() : `field_${index + 1}`;
            const labelSource =
                typeof item.label === "string" && item.label.trim() ? item.label.trim() : `Field ${index + 1}`;

            const field: DomainFieldConfig = {
                key: keySource,
                label: labelSource,
                type: normalizedType,
                ...(typeof item.placeholder === "string" ? { placeholder: item.placeholder } : {}),
                ...(Number.isFinite(Number(item.min)) ? { min: Number(item.min) } : {}),
                ...(Number.isFinite(Number(item.max)) ? { max: Number(item.max) } : {}),
                ...(Array.isArray(item.options)
                    ? {
                        options: item.options
                            .filter((option): option is string => typeof option === "string" && option.trim().length > 0)
                            .map((option) => option.trim()),
                    }
                    : {}),
            };

            return field;
        })
        .filter((field, index, arr) => {
            if (!field.key) return false;
            return arr.findIndex((candidate) => candidate.key === field.key) === index;
        });

    if (normalized.length === 0) {
        return defaultCustomFields;
    }

    const hasName = normalized.some((field) => field.key === "name");
    const hasScore = normalized.some((field) => field.key === "score");

    const next = [...normalized];
    if (!hasName) {
        next.unshift({ key: "name", label: "Profile Name", type: "text", placeholder: "Case A" });
    }
    if (!hasScore) {
        next.push({ key: "score", label: "Model Score", type: "number", min: 0, max: 100 });
    }

    return next;
}

export function getCustomDomainConfig(): DomainConfig {
    if (typeof window === "undefined") {
        return defaultCustomDomain;
    }

    try {
        const raw = window.localStorage.getItem(CUSTOM_DOMAIN_CONFIG_KEY);
        if (!raw) {
            return defaultCustomDomain;
        }

        const parsed = JSON.parse(raw) as unknown;
        const fields = sanitizeCustomFields(parsed);

        return {
            ...defaultCustomDomain,
            fields,
            defaultProfile: {
                ...buildDefaultProfile(fields),
            },
        };
    } catch {
        return defaultCustomDomain;
    }
}
