/**
 * RFC 4180-aware CSV parser/exporter that correctly handles:
 * - Quoted fields containing commas, newlines, and escaped quotes
 * - Empty fields
 * - Mixed quoted/unquoted fields
 * - Spreadsheet formula escaping on export
 *
 * Issue #42 fix: The previous naive split(",") broke on quoted CSV
 * fields like `"New York, NY"` which contain commas.
 */

function parseCsvRows(raw: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    const pushField = () => {
        row.push(current.trim());
        current = "";
    };

    const pushRow = () => {
        pushField();
        if (row.some((field) => field.length > 0)) {
            rows.push(row);
        }
        row = [];
    };

    while (i < raw.length) {
        const char = raw[i];

        if (inQuotes) {
            if (char === '"') {
                // Check for escaped quote (double-quote inside quoted field)
                if (i + 1 < raw.length && raw[i + 1] === '"') {
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
            pushField();
            i += 1;
            continue;
        }

        if (char === "\n") {
            pushRow();
            i += 1;
            continue;
        }

        if (char === "\r") {
            if (raw[i + 1] === "\n") {
                pushRow();
                i += 2;
                continue;
            }
            pushRow();
            i += 1;
            continue;
        }

        current += char;
        i += 1;
    }

    if (current.length > 0 || row.length > 0) {
        pushRow();
    }

    return rows;
}

export function parseCSV(raw: string): Record<string, string>[] {
    const rows = parseCsvRows(raw);
    if (rows.length === 0) return [];

    const headers = rows[0];

    return rows
        .slice(1)
        .filter((row) => row.some((cell) => cell.trim().length > 0))
        .map((values) => {
            return Object.fromEntries(
                headers.map((header, index) => [header, values[index] ?? ""]),
            );
        });
}

export function escapeCsvField(value: unknown): string {
    let text = String(value ?? "");
    if (/^[=+\-@]/.test(text)) {
        text = `'${text}`;
    }
    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

export function recordsToCSV(records: Record<string, unknown>[]): string {
    if (records.length === 0) {
        return "";
    }

    const headers = Object.keys(records[0]);
    const headerLine = headers.map((h) => escapeCsvField(h)).join(",");
    const rows = records.map((record) => headers.map((header) => escapeCsvField(record[header])).join(","));
    return [headerLine, ...rows].join("\n");
}

export function downloadCSV(filename: string, content: string): void {
    if (typeof window === "undefined") {
        return;
    }

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}
