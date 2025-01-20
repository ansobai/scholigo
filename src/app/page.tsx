import HeroSection from "@/components/landing/hero";
import FeaturesSection from "@/components/landing/features";
import CtaSection from "@/components/landing/cta";
import Footer from "@/components/landing/footer";

export default function LandingPage() {
  return (
      <div
          className="min-h-screen bg-gradient-to-br from-darkBlue via-purple-900 to-blackBluish text-lightYellow overflow-hidden">
          <HeroSection/>
          <FeaturesSection/>
          <CtaSection/>
          <Footer/>
      </div>
  );
}
