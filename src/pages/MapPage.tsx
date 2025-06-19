
import { useEffect, useState } from "react";
import { MapPin, ExternalLink, Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type EventLocation = {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  lat?: number;
  lng?: number;
};

export default function MapPage() {
  const { user } = useAuth();
  const [eventLocations, setEventLocations] = useState<EventLocation[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventLocation | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events-map"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("events")
        .select("id, title, location, date, time")
        .eq("user_id", user.id)
        .not("location", "is", null);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!events.length) return;

      const locationsWithCoords = await Promise.all(
        events.map(async (event) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(event.location)}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
              return {
                ...event,
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
              };
            }
            return event;
          } catch (error) {
            console.error("Geocoding error:", error);
            return event;
          }
        })
      );

      setEventLocations(locationsWithCoords);
    };

    fetchCoordinates();
  }, [events]);

  const openInGoogleMaps = (location: string) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(googleMapsUrl, '_blank');
  };

  if (isLoading) {
    return (
      <section className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-3 text-blue-200">
        <span className="icon-round bg-blue-400/20 shadow-glass">
          <MapPin className="w-8 h-8 stroke-blue-300" />
        </span>
        Event Locations
      </h1>

      {eventLocations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-400/60" />
          <p className="text-blue-100/60 text-lg">No events with locations found</p>
          <p className="text-blue-100/40 text-sm mt-2">Create events with valid addresses to see them on the map</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {eventLocations.map((event) => (
            <Card key={event.id} className="bg-glass border border-border shadow-glass rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-blue-50 font-bold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-blue-100/70 mt-1">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('en-GB')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-400/10 rounded-lg border border-blue-400/20">
                    <p className="text-blue-100/90 text-sm font-medium">{event.location}</p>
                    {event.lat && event.lng && (
                      <p className="text-blue-100/60 text-xs mt-1">
                        Coordinates: {event.lat.toFixed(6)}, {event.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => openInGoogleMaps(event.location)}
                    className="w-full glass border-2 border-green-400/60 text-green-100 font-bold tracking-wide rounded-full shadow-glass hover:bg-green-400/20"
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get Directions in Google Maps
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
