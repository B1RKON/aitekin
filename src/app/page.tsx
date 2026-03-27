import CodeRain from "@/components/landing/CodeRain";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ToolsSection from "@/components/landing/ToolsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <CodeRain />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ToolsSection />
        <FeaturesSection />
        <Footer />
      </div>
    </>
  );
}
