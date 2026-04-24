import Badge from "@/components/shared/Badge";
import { formatThreshold, formatVariationName, normalizeDecisionTone } from "@/lib/format";
import { Decision, VariationResult } from "@/types/audit";

interface VariationRowProps {
    row: VariationResult;
    baselineScore: number;
    baselineDecision: Decision;
}

export default function VariationRow({
    row,
    baselineScore,
    baselineDecision,
}: VariationRowProps) {
    const isDecisionFlipped = row.changed || row.decision !== baselineDecision;

    const rowClassName = isDecisionFlipped
        ? "bg-signal-risk/5"
        : "bg-transparent";

    const profileMeta = row.profile
        ? [
            row.profile.gender ? `Gender: ${row.profile.gender}` : null,
            row.profile.location ? `Location: ${row.profile.location}` : null,
            row.profile.college ? `College: ${row.profile.college}` : null,
        ].filter(Boolean).join(" · ")
        : "";

    return (
        <tr className={rowClassName}>
            <td className="px-4 py-3 font-mono text-mono-base text-txt-primary">
                <p>{formatVariationName(row.label)}</p>
                {profileMeta ? <p className="mt-1 text-xs font-normal text-txt-ghost">{profileMeta}</p> : null}
            </td>
            <td className="px-4 py-3 font-mono text-mono-base text-txt-secondary">{formatThreshold(row.score)}</td>
            <td className="px-4 py-3">
                <Badge label={row.decision} tone={normalizeDecisionTone(row.decision)} dot />
            </td>
            <td className="px-4 py-3">
                <Badge
                    label={isDecisionFlipped ? "Flipped" : "Unchanged"}
                    tone={isDecisionFlipped ? "risk" : "stable"}
                    dot
                />
            </td>
        </tr>
    );
}
