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
        placeholder: "Value",
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
        <div className="space-y-3">
            {fields.map((field, index) => (
                <div
                    key={`${field.key}-${index}`}
                    draggable={!disabled}
                    onDragStart={() => setDraggingIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => onDrop(index)}
                    className="grid gap-2 rounded-inset border border-rim bg-s3 p-3 sm:grid-cols-12"
                >
                    <button
                        type="button"
                        disabled={disabled}
                        className="sm:col-span-1 cursor-grab rounded-[4px] border border-rim bg-s2 px-2 py-1 text-xs text-t2"
                        aria-label="Drag field"
                    >
                        ☰
                    </button>

                    <input
                        value={field.key}
                        onChange={(event) => updateField(index, { key: event.target.value.trim() })}
                        disabled={disabled}
                        placeholder="field_key"
                        className="sm:col-span-3 rounded-[4px] border border-rim bg-s2 px-3 py-2 font-mono text-xs text-t1 outline-none transition-fast focus:border-a-violet disabled:opacity-50"
                    />

                    <input
                        value={field.label}
                        onChange={(event) => updateField(index, { label: event.target.value })}
                        disabled={disabled}
                        placeholder="Field Label"
                        className="sm:col-span-3 rounded-[4px] border border-rim bg-s2 px-3 py-2 font-mono text-xs text-t1 outline-none transition-fast focus:border-a-violet disabled:opacity-50"
                    />

                    <select
                        value={field.type}
                        onChange={(event) =>
                            updateField(index, {
                                type: event.target.value as DomainFieldConfig["type"],
                            })
                        }
                        disabled={disabled}
                        className="sm:col-span-2 rounded-[4px] border border-rim bg-s2 px-3 py-2 font-mono text-xs text-t1 outline-none transition-fast focus:border-a-violet disabled:opacity-50"
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
                        className="sm:col-span-1 rounded-[4px] border border-a-crimson/40 bg-a-crimson-surface px-2 py-1 font-mono text-xs text-a-crimson disabled:opacity-50"
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
                                className="sm:col-span-2 rounded-[4px] border border-rim bg-s2 px-3 py-2 font-mono text-xs text-t1 outline-none transition-fast focus:border-a-violet disabled:opacity-50"
                            />
                            <input
                                type="number"
                                value={field.max ?? 100}
                                onChange={(event) => updateField(index, { max: Number(event.target.value) })}
                                disabled={disabled}
                                placeholder="Max"
                                className="sm:col-span-2 rounded-[4px] border border-rim bg-s2 px-3 py-2 font-mono text-xs text-t1 outline-none transition-fast focus:border-a-violet disabled:opacity-50"
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
                            placeholder="Option A, Option B"
                            className="sm:col-span-4 rounded-[4px] border border-rim bg-s2 px-3 py-2 font-mono text-xs text-t1 outline-none transition-fast focus:border-a-violet disabled:opacity-50"
                        />
                    ) : null}
                </div>
            ))}

            <div className="flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={addField}
                    disabled={disabled}
                    className="rounded-[4px] border border-a-violet/40 bg-a-violet-surface px-3 py-2 font-mono text-xs text-a-violet transition-fast hover:bg-a-violet/20 disabled:opacity-50"
                >
                    + Add Field
                </button>

                {hasDuplicateKeys ? (
                    <p className="font-mono text-xs text-a-crimson">Field keys must be unique.</p>
                ) : (
                    <p className="font-body text-xs text-t2">Fields auto-save locally.</p>
                )}
            </div>
        </div>
    );
}
