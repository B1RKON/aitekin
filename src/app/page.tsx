import MaintenancePage from "@/components/MaintenancePage";
import ShowroomWrapper from "@/components/3d/showroom/ShowroomWrapper";

export default function Home() {
  // Server-side env check: MAINTENANCE_MODE=true ise bakim sayfasi
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  // Lokal/production non-maintenance: FPS Showroom
  return <ShowroomWrapper />;
}
