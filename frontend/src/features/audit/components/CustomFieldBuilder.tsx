"use client";

import { useEffect, useMemo, useState } from "react";

import Card from "@/components/shared/Card";
import { DomainFieldConfig } from "@/lib/domains";
import { getCustomDomainFields, saveCustomDomainFields } from "@/lib/storage";

interface CustomFieldBuilderProps {
    onChange: (fields: DomainFieldConfig[]) => void;
}

const FIELD_TYPES: Array<DomainFieldConfig["type"]> = ["text", "number", "select"];

function createField(index: number): DomainFieldConfig {
    return {
        key: `field_${index}`,
        label: `Field ${index}`,
        type: "text",
        placeholder: "Value",
    };
}

function parseOptions(raw: string): string[] {
    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function CustomFieldBuilder({ onChange }: CustomFieldBuilderProps) {
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
        <Card title="Custom Field Builder" subtitle="Define profile fields for your own domain">
            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div
                        key={`${field.key}-${index}`}
                        draggable
                        onDragStart={() => setDraggingIndex(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => onDrop(index)}
                        className="grid gap-2 rounded-xl border border-ink-600/70 bg-ink-900/45 p-3 sm:grid-cols-12"
                    >
                        <button
                            type="button"
                            className="sm:col-span-1 rounded-lg border border-ink-600 bg-ink-700/70 px-2 py-1 text-xs"
                            aria-label="Drag field"
                        >
                            ☰
                        </button>

                        <input
                            value={field.key}
                            onChange={(event) => updateField(index, { key: event.target.value.trim() })}
                            placeholder="field_key"
                            className="sm:col-span-3 rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50"
                        />

                        <input
                            value={field.label}
                            onChange={(event) => updateField(index, { label: event.target.value })}
                            placeholder="Field Label"
                            className="sm:col-span-3 rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50"
                        />

                        <select
                            value={field.type}
                            onChange={(event) =>
                                updateField(index, {
                                    type: event.target.value as DomainFieldConfig["type"],
                                })
                            }
                            className="sm:col-span-2 rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50"
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
                            className="sm:col-span-1 rounded-lg border border-signal-risk/40 bg-signal-riskSoft/30 px-2 py-1 text-xs text-signal-risk"
                        >
                            Delete
                        </button>

                        {field.type === "number" ? (
                            <>
                                <input
                                    type="number"
                                    value={field.min ?? 0}
                                    onChange={(event) => updateField(index, { min: Number(event.target.value) })}
                                    placeholder="Min"
                                    className="sm:col-span-2 rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50"
                                />
                                <input
                                    type="number"
                                    value={field.max ?? 100}
                                    onChange={(event) => updateField(index, { max: Number(event.target.value) })}
                                    placeholder="Max"
                                    className="sm:col-span-2 rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50"
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
                                placeholder="Option A, Option B"
                                className="sm:col-span-4 rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50"
                            />
                        ) : null}
                    </div>
                ))}

                <div className="flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={addField}
                        className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-3 py-2 text-xs font-semibold text-signal-info"
                    >
                        + Add Field
                    </button>

                    {hasDuplicateKeys ? (
                        <p className="text-xs text-signal-risk">Field keys must be unique.</p>
                    ) : (
                        <p className="text-xs text-ink-200">Fields auto-save locally.</p>
                    )}
                </div>
            </div>
        </Card>
    );
}
