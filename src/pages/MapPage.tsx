
import { Map } from "lucide-react";

export default function MapPage() {
  return (
    <section className="w-full max-w-3xl mx-auto py-10 px-4 flex flex-col items-center">
      <div className="flex items-center gap-3 mb-4">
        <Map className="w-8 h-8 stroke-blue-600" />
        <h1 className="text-3xl font-bold">Your Event Map</h1>
      </div>
      <div className="min-h-[350px] w-full flex flex-col items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground shadow">
        <span className="text-lg mb-2">Map coming soon!</span>
        <span className="text-sm text-gray-500 max-w-md text-center">
          To enable the interactive world map, add your Mapbox public token. See developer instructions.
        </span>
      </div>
    </section>
  );
}
