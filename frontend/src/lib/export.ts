// Responsible for all client-side export utilities.
// Currently implements printAuditReport. Later can be extended with exportToCSV, exportToJSON, etc.
export function printAuditReport(reportTitle: string): void {
    if (typeof window === "undefined") {
        return;
    }

    const originalTitle = document.title;
    document.title = `DecisioLens — ${reportTitle}`;
    window.print();
    document.title = originalTitle;
}
