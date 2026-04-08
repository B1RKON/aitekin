import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ToolsSection from "@/components/landing/ToolsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="bg-base-100 text-text-primary">
      <Navbar />
      <HeroSection />
      <ToolsSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
