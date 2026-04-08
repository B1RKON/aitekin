import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ToolsSection from "@/components/landing/ToolsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import SceneWrapper from "@/components/3d/SceneWrapper";
import P5Wrapper from "@/components/3d/P5Wrapper";

export default function Home() {
  return (
    <>
      {/* Layer 0: Three.js 3D sahne (en arkada) */}
      <SceneWrapper />

      {/* Layer 1: P5.js particle flow field (3D uzerinde) */}
      <P5Wrapper />

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
