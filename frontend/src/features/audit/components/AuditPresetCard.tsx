import Card from "@/components/shared/Card";

export default function AuditPresetCard() {
    return (
        <Card title="Audit Preview" subtitle="What the system will do">
            <ul className="space-y-2 text-sm text-ink-100">
                <li>• Score candidate profile</li>
                <li>• Test threshold sensitivity</li>
                <li>• Evaluate scenario variations</li>
                <li>• Generate explanation and appeal</li>
            </ul>
        </Card>
    );
}
