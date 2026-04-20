import Badge from "@/components/shared/Badge";
import { formatReasonTag } from "@/lib/format";

interface ReasonTagsProps {
    reasonTags: string[];
}

function getTagTone(tag: string): "stable" | "caution" | "risk" | "info" {
    if (tag.includes("bias")) return "risk";
    if (tag.includes("instability") || tag.includes("threshold")) return "caution";
    return "info";
}

export default function ReasonTags({ reasonTags }: ReasonTagsProps) {
    const tags = reasonTags.length > 0 ? reasonTags : ["none"];

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <Badge key={tag} label={formatReasonTag(tag)} tone={getTagTone(tag)} />
            ))}
        </div>
    );
}
