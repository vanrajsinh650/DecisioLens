import dynamic from "next/dynamic";
import HeroSection from "@/features/landing/components/HeroSection";
import HowItWorks from "@/features/landing/components/HowItWorks";
import FeatureHighlights from "@/features/landing/components/FeatureHighlights";
import WhySection from "@/features/landing/components/WhySection";
import CTASection from "@/features/landing/components/CTASection";
import Footer from "@/features/landing/components/Footer";

const ParticleCanvas = dynamic(
    () => import("@/components/shared/ParticleCanvas"),
    { ssr: false }
);

export default function LandingPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <ParticleCanvas />
            <HeroSection />
            <HowItWorks />
            <FeatureHighlights />
            <WhySection />
            <CTASection />
            <Footer />
        </div>
    );
}
