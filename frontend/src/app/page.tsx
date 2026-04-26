import dynamic from "next/dynamic";
import HeroSection from "@/features/landing/components/HeroSection";
import MarqueeSection from "@/features/landing/components/MarqueeSection";
import HowItWorks from "@/features/landing/components/HowItWorks";
import FeatureHighlights from "@/features/landing/components/FeatureHighlights";
import VerdictPanel from "@/features/landing/components/VerdictPanel";
import BreakdownSection from "@/features/landing/components/BreakdownSection";
import WhySection from "@/features/landing/components/WhySection";
import ProofSection from "@/features/landing/components/ProofSection";
import CTASection from "@/features/landing/components/CTASection";
import Footer from "@/features/landing/components/Footer";

const ParticleCanvas = dynamic(
    () => import("@/components/shared/ParticleCanvas"),
    { ssr: false }
);

export default function LandingPage() {
    return (
        <div className="landing-page">
            <ParticleCanvas />
            <HeroSection />
            <MarqueeSection />
            <HowItWorks />
            <FeatureHighlights />
            <VerdictPanel />
            <BreakdownSection />
            <WhySection />
            <ProofSection />
            <CTASection />
            <Footer />
        </div>
    );
}
