import CTASection from "@/components/landing/CTASection";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import HeroSection from "@/components/landing/HeroSection";

export default function LandingExperience() {
    return (
        <div className="space-y-6">
            <HeroSection />
            <FeatureHighlights />
            <CTASection />
        </div>
    );
}
