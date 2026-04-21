export function parseCSV(raw: string): Record<string, string>[] {
    const [headerLine, ...rows] = raw.trim().split("\n");
    const headers = headerLine.split(",").map((header) => header.trim());

    return rows
        .filter((row) => row.trim().length > 0)
        .map((row) => {
            const values = row.split(",").map((value) => value.trim());
            return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
        });
}

export function recordsToCSV(records: Record<string, unknown>[]): string {
    if (records.length === 0) {
        return "";
    }

    const headers = Object.keys(records[0]);
    const rows = records.map((record) => headers.map((header) => String(record[header] ?? "")).join(","));
    return [headers.join(","), ...rows].join("\n");
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
