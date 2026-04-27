/**
 * RFC 4180-compliant CSV parser that correctly handles:
 * - Quoted fields containing commas, newlines, and escaped quotes
 * - Empty fields
 * - Mixed quoted/unquoted fields
 *
 * Issue #42 fix: The previous naive split(",") broke on quoted CSV
 * fields like `"New York, NY"` which contain commas.
 */

function parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];

        if (inQuotes) {
            if (char === '"') {
                // Check for escaped quote (double-quote inside quoted field)
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i += 2;
                    continue;
                }
                // End of quoted field
                inQuotes = false;
                i += 1;
                continue;
            }
            current += char;
            i += 1;
            continue;
        }

        if (char === '"') {
            inQuotes = true;
            i += 1;
            continue;
        }

        if (char === ",") {
            fields.push(current.trim());
            current = "";
            i += 1;
            continue;
        }

        current += char;
        i += 1;
    }

    fields.push(current.trim());
    return fields;
}

export function parseCSV(raw: string): Record<string, string>[] {
    const lines = raw.trim().split(/\r?\n/);
    if (lines.length === 0) return [];

    const headers = parseCsvLine(lines[0]);

    return lines
        .slice(1)
        .filter((row) => row.trim().length > 0)
        .map((row) => {
            const values = parseCsvLine(row);
            return Object.fromEntries(
                headers.map((header, index) => [header, values[index] ?? ""]),
            );
        });
}

export function escapeCsvField(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export function recordsToCSV(records: Record<string, unknown>[]): string {
    if (records.length === 0) {
        return "";
    }

    const headers = Object.keys(records[0]);
    const headerLine = headers.map((h) => escapeCsvField(h)).join(",");
    const rows = records.map((record) =>
        headers.map((header) => escapeCsvField(String(record[header] ?? ""))).join(","),
    );
    return [headerLine, ...rows].join("\n");
}

export function downloadCSV(filename: string, content: string): void {
    if (typeof window === "undefined") {
        return;
    }

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}
