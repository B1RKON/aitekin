import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ToolsSection from "@/components/landing/ToolsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import SceneWrapper from "@/components/3d/SceneWrapper";

export default function Home() {
  return (
    <>
      {/* 3D Arka plan - tum sayfada gorunur, pointer-events yok */}
      <SceneWrapper />

      <main className="relative z-10 bg-transparent text-text-primary">
        <Navbar />
        <HeroSection />
        <ToolsSection />
        <FeaturesSection />
        <Footer />
      </main>
    </>
  );
}
