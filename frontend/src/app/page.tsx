import HeroSection from "@/features/landing/components/HeroSection";
import FeatureHighlights from "@/features/landing/components/FeatureHighlights";
import CTASection from "@/features/landing/components/CTASection";

export default function LandingPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
            <HeroSection />
            <FeatureHighlights />
            <CTASection />
        </div>
    );
}
