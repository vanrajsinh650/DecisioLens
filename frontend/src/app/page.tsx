import dynamic from "next/dynamic";
import HeroSection from "@/features/landing/components/HeroSection";
import FeatureHighlights from "@/features/landing/components/FeatureHighlights";
import CTASection from "@/features/landing/components/CTASection";

const ParticleCanvas = dynamic(
    () => import("@/components/shared/ParticleCanvas"),
    { ssr: false }
);

export default function LandingPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
            <ParticleCanvas />
            <HeroSection />
            <FeatureHighlights />
            <CTASection />
        </div>
    );
}
