import CTASection from "@/features/landing/components/CTASection";
import FeatureHighlights from "@/features/landing/components/FeatureHighlights";
import HeroSection from "@/features/landing/components/HeroSection";

export default function LandingPage() {
    return (
        <div className="space-y-8">
            <HeroSection />
            <FeatureHighlights />
            <CTASection />
        </div>
    );
}
