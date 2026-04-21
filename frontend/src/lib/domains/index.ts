import { AuditProfile, DomainType } from "@/types/audit";

export interface DomainFieldConfig {
    key: string;
    label: string;
    type: "text" | "number" | "select";
    options?: string[];
    min?: number;
    max?: number;
    placeholder?: string;
}

export interface DomainPresetConfig {
    id: string;
    title: string;
    description: string;
    threshold: number;
    profile: AuditProfile;
}

export interface DomainConfig {
    value: DomainType;
    label: string;
    description: string;
    defaultThreshold: number;
    fields: DomainFieldConfig[];
    defaultProfile: AuditProfile;
    variationLabels: Record<string, string>;
    presets?: DomainPresetConfig[];
}
