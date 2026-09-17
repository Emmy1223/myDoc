import { getSessionUserId } from "@/lib/session";
import LandingNav from "@/components/marketing/LandingNav";
import LandingHero from "@/components/marketing/LandingHero";
import ProblemSection from "@/components/marketing/ProblemSection";
import ProductOverview from "@/components/marketing/ProductOverview";
import HowItWorks from "@/components/marketing/HowItWorks";
import TailorDeepDive from "@/components/marketing/TailorDeepDive";
import ParseDeepDive from "@/components/marketing/ParseDeepDive";
import EditorDeepDive from "@/components/marketing/EditorDeepDive";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import ComingSoon from "@/components/marketing/ComingSoon";
import TrustSection from "@/components/marketing/TrustSection";
import PricingSection from "@/components/marketing/PricingSection";
import FaqSection from "@/components/marketing/FaqSection";
import FinalCta from "@/components/marketing/FinalCta";
import LandingFooter from "@/components/marketing/LandingFooter";

export default async function HomePage() {
  const userId = await getSessionUserId();
  const isSignedIn = Boolean(userId);

  return (
    <div className="min-h-screen bg-paper">
      <LandingNav isSignedIn={isSignedIn} />
      <main>
        <LandingHero />
        <ProblemSection />
        <ProductOverview />
        <HowItWorks />
        <TailorDeepDive />
        <ParseDeepDive />
        <EditorDeepDive />
        <FeatureGrid />
        <ComingSoon />
        <TrustSection />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}