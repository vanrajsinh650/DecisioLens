import CTASection from "./components/CTASection";
import FeatureHighlights from "./components/FeatureHighlights";
import HeroSection from "./components/HeroSection";

export default function LandingExperience() {
    return (
        <div style={{ overflow: "visible" }}>
            <HeroSection />
            <FeatureHighlights />
            <CTASection />
        </div>
    );
}
