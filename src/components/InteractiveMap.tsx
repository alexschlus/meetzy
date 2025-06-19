
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EventLocation = {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
};

type InteractiveMapProps = {
  events: EventLocation[];
  mapboxToken: string;
};

export default function InteractiveMap({ events, mapboxToken }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventLocation | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Dynamically import Mapbox GL JS
    import('mapbox-gl').then((mapboxgl) => {
      import('mapbox-gl/dist/mapbox-gl.css');
      
      mapboxgl.default.accessToken = mapboxToken;
      
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: events.length > 0 ? [events[0].lng, events[0].lat] : [0, 0],
        zoom: events.length > 0 ? 10 : 2,
      });

      // Add markers for each event
      events.forEach((event) => {
        if (event.lat && event.lng) {
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEwQzIxIDcuNzkwODYgMTkuMjA5MSA2IDEyIDZDNC43OTA4NiA2IDMgNy43OTA4NiAzIDEwQzMgMTIuMjA5MSA0Ljc5MDg2IDE0IDEyIDE0QzE5LjIwOTEgMTQgMjEgMTIuMjA5MSAyMSAxMFoiIGZpbGw9IiM0Nzc4RkYiLz4KPHBhdGggZD0iTTEyIDJMMTIgMjIiIHN0cm9rZT0iIzQ3NzhGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+)';
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.backgroundSize = 'contain';
          el.style.cursor = 'pointer';

          el.addEventListener('click', () => {
            setSelectedEvent(event);
          });

          new mapboxgl.default.Marker(el)
            .setLngLat([event.lng, event.lat])
            .addTo(map.current);
        }
      });

      // Fit map to show all markers
      if (events.length > 1) {
        const bounds = new mapboxgl.default.LngLatBounds();
        events.forEach((event) => {
          if (event.lat && event.lng) {
            bounds.extend([event.lng, event.lat]);
          }
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [events, mapboxToken]);

  const openInGoogleMaps = (location: string) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {selectedEvent && (
        <div className="absolute bottom-4 left-4 right-4 bg-glass border border-border shadow-glass rounded-2xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-blue-50 font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                {selectedEvent.title}
              </h3>
              <p className="text-blue-100/70 text-sm">
                {new Date(selectedEvent.date).toLocaleDateString('en-GB')} at {selectedEvent.time}
              </p>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-blue-100/60 hover:text-blue-100 text-lg"
            >
              ×
            </button>
          </div>
          <p className="text-blue-100/90 text-sm mb-3">{selectedEvent.location}</p>
          <Button
            onClick={() => openInGoogleMaps(selectedEvent.location)}
            className="w-full glass border-2 border-green-400/60 text-green-100 font-bold tracking-wide rounded-full shadow-glass hover:bg-green-400/20"
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </div>
      )}
    </div>
  );
}
