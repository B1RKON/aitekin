import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ToolsSection from "@/components/landing/ToolsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import SceneWrapper from "@/components/3d/SceneWrapper";
import P5Wrapper from "@/components/3d/P5Wrapper";
import MaintenancePage from "@/components/MaintenancePage";

export default function Home() {
  // Server-side env check: MAINTENANCE_MODE=true ise bakim sayfasi
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <>
      {/* Layer 0: Three.js 3D sahne */}
      <SceneWrapper />

      {/* Layer 1: P5.js particle flow field */}
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
