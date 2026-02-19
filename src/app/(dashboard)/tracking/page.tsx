import Header from "@/components/layout/header";
import MapContainer from "@/components/gods-eye/tracking-map/map-container";

export default function TrackingPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="LIVE TRACKING" subtitle="Global Target Surveillance" />
      <div className="flex-1 relative overflow-hidden">
        <MapContainer />
      </div>
    </div>
  );
}