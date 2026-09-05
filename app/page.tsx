import Nav from "@/components/marketing/Nav";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import FeatureShowcase from "@/components/marketing/FeatureShowcase";
import CtaSection from "@/components/marketing/CtaSection";
import Footer from "@/components/marketing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav />
      <Hero />
      <HowItWorks />
      <FeatureShowcase />
      <CtaSection />
      <Footer />
    </main>
  );
}
