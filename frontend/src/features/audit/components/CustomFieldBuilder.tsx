"use client";

import { useEffect, useMemo, useState } from "react";

import { DomainFieldConfig } from "@/lib/domains";
import { getCustomDomainFields, saveCustomDomainFields } from "@/lib/storage";

interface CustomFieldBuilderProps {
    fields?: DomainFieldConfig[];
    onChange: (fields: DomainFieldConfig[]) => void;
    disabled?: boolean;
}

const FIELD_TYPES: Array<DomainFieldConfig["type"]> = ["text", "number", "select"];

function createField(index: number): DomainFieldConfig {
    return {
        key: `field_${index}`,
        label: `Field ${index}`,
        type: "text",
        placeholder: "Enter value",
    };
}

function parseOptions(raw: string): string[] {
    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function CustomFieldBuilder({ onChange, disabled }: CustomFieldBuilderProps) {
    const [fields, setFields] = useState<DomainFieldConfig[]>([]);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    useEffect(() => {
        const saved = getCustomDomainFields();
        setFields(saved);
        onChange(saved);
    }, [onChange]);

    const persist = (next: DomainFieldConfig[]) => {
        setFields(next);
        saveCustomDomainFields(next);
        onChange(next);
    };

    const addField = () => {
        const next = [...fields, createField(fields.length + 1)];
        persist(next);
    };

    const updateField = (index: number, patch: Partial<DomainFieldConfig>) => {
        const next = fields.map((field, fieldIndex) =>
            fieldIndex === index
                ? {
                    ...field,
                    ...patch,
                }
                : field,
        );
        persist(next);
    };

    const removeField = (index: number) => {
        const next = fields.filter((_, fieldIndex) => fieldIndex !== index);
        persist(next.length > 0 ? next : [createField(1)]);
    };

    const hasDuplicateKeys = useMemo(() => {
        const keys = fields.map((field) => field.key.trim()).filter(Boolean);
        return new Set(keys).size !== keys.length;
    }, [fields]);

    const onDrop = (targetIndex: number) => {
        if (draggingIndex === null || draggingIndex === targetIndex) {
            return;
        }

        const next = [...fields];
        const [dragged] = next.splice(draggingIndex, 1);
        next.splice(targetIndex, 0, dragged);
        persist(next);
        setDraggingIndex(null);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {fields.map((field, index) => (
                <div
                    key={`${field.key}-${index}`}
                    draggable={!disabled}
                    onDragStart={() => setDraggingIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => onDrop(index)}
                    style={{
                        display: "grid",
                        gap: "8px",
                        gridTemplateColumns: "auto 1fr 1fr auto auto",
                        alignItems: "center",
                        background: "var(--s3)",
                        border: "1px solid var(--rim)",
                        borderRadius: "4px",
                        padding: "12px",
                    }}
                >
                    <button
                        type="button"
                        disabled={disabled}
                        className="font-mono"
                        style={{
                            cursor: "grab",
                            background: "var(--s2)",
                            border: "1px solid var(--rim)",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            color: "var(--t2)",
                        }}
                        aria-label="Drag field"
                    >
                        ☰
                    </button>

                    <input
                        value={field.key}
                        onChange={(event) => updateField(index, { key: event.target.value.trim() })}
                        disabled={disabled}
                        placeholder="field_key"
                        className="dl-input"
                        style={{ fontSize: "0.75rem" }}
                    />

                    <input
                        value={field.label}
                        onChange={(event) => updateField(index, { label: event.target.value })}
                        disabled={disabled}
                        placeholder="Field Label"
                        className="dl-input"
                        style={{ fontSize: "0.75rem" }}
                    />

                    <select
                        value={field.type}
                        onChange={(event) =>
                            updateField(index, {
                                type: event.target.value as DomainFieldConfig["type"],
                            })
                        }
                        disabled={disabled}
                        className="dl-select"
                        style={{ fontSize: "0.75rem", minWidth: "80px" }}
                    >
                        {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => removeField(index)}
                        disabled={disabled}
                        className="font-mono"
                        style={{
                            background: "var(--aurora-crimson-surface)",
                            border: "1px solid hsl(350, 68%, 30%)",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            color: "var(--aurora-crimson)",
                            cursor: "pointer",
                            opacity: disabled ? 0.5 : 1,
                        }}
                    >
                        Delete
                    </button>

                    {field.type === "number" ? (
                        <>
                            <input
                                type="number"
                                value={field.min ?? 0}
                                onChange={(event) => updateField(index, { min: Number(event.target.value) })}
                                disabled={disabled}
                                placeholder="Min"
                                className="dl-input"
                                style={{ fontSize: "0.75rem", gridColumn: "2 / 3" }}
                            />
                            <input
                                type="number"
                                value={field.max ?? 100}
                                onChange={(event) => updateField(index, { max: Number(event.target.value) })}
                                disabled={disabled}
                                placeholder="Max"
                                className="dl-input"
                                style={{ fontSize: "0.75rem", gridColumn: "3 / 4" }}
                            />
                        </>
                    ) : null}

                    {field.type === "select" ? (
                        <input
                            value={field.options?.join(", ") ?? ""}
                            onChange={(event) =>
                                updateField(index, {
                                    options: parseOptions(event.target.value),
                                })
                            }
                            disabled={disabled}
                            placeholder="Option 1, Option 2"
                            className="dl-input"
                            style={{ fontSize: "0.75rem", gridColumn: "2 / 5" }}
                        />
                    ) : null}
                </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <button
                    type="button"
                    onClick={addField}
                    disabled={disabled}
                    className="font-mono"
                    style={{
                        background: "var(--aurora-violet-surface)",
                        border: "1px solid hsl(265, 65%, 30%)",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        fontSize: "0.75rem",
                        color: "var(--aurora-violet)",
                        cursor: "pointer",
                        opacity: disabled ? 0.5 : 1,
                        transition: "all 0.15s ease",
                    }}
                >
                    + Add Field
                </button>

                {hasDuplicateKeys ? (
                    <p className="font-mono text-xs" style={{ color: "var(--aurora-crimson)" }}>Field keys must be unique.</p>
                ) : (
                    <p className="font-body text-xs text-t2">Fields auto-save locally.</p>
                )}
            </div>
        </div>
    );
}
