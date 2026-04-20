import CTASection from "./components/CTASection";
import FeatureHighlights from "./components/FeatureHighlights";
import HeroSection from "./components/HeroSection";

export default function LandingExperience() {
    return (
        <div className="space-y-6">
            <HeroSection />
            <FeatureHighlights />
            <CTASection />
        </div>
    );
}
