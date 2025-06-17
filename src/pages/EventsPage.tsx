
import { Calendar, MapPin, Clock, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AddEventDialog from "@/components/AddEventDialog";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

type SupabaseEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string | null;
  attendees: any;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export default function EventsPage() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<SupabaseEvent | null>(null);
  const [messages, setMessages] = useState<{[eventId: string]: Array<{sender: string, text: string, timestamp: string}>}>({});

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SupabaseEvent[];
    },
    enabled: !!user,
  });

  // Mock friends data for the dialogs
  const mockFriends = [
    { id: 1, name: "Alice", avatar: "", status: "online" },
    { id: 2, name: "Bob", avatar: "", status: "offline" },
  ];

  const handleSendMessage = (eventId: string, message: {sender: string, text: string, timestamp: string}) => {
    setMessages(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), message]
    }));
  };

  return (
    <section className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-3 text-blue-200">
        <span className="icon-round bg-blue-400/20 shadow-glass">
          <Calendar className="w-8 h-8 stroke-blue-300" />
        </span>{" "}
        Events
      </h1>
      <div className="flex items-center mb-8 gap-2">
        <AddEventDialog friends={mockFriends} onAdd={() => refetch()} />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-blue-100/60">No events yet!</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="bg-glass border border-border shadow-glass rounded-2xl"
            >
              <CardHeader>
                <CardTitle className="text-blue-50 font-bold">{event.title}</CardTitle>
                <CardDescription className="text-blue-100/70">
                  {event.date} - {event.time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-blue-100/90 mb-4">{event.description}</div>
                <div className="flex items-center gap-2 text-blue-100/70">
                  <MapPin className="w-4 h-4" />
                  {event.location || "No location specified"}
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setSelectedEvent(event)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <EventDetailsDialog
        event={selectedEvent ? {
          id: parseInt(selectedEvent.id) || 1,
          title: selectedEvent.title,
          date: selectedEvent.date,
          time: selectedEvent.time,
          location: selectedEvent.location || "",
          description: selectedEvent.description || "",
          attendees: Array.isArray(selectedEvent.attendees) ? selectedEvent.attendees : []
        } : null}
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
        friends={mockFriends}
        messages={selectedEvent ? (messages[selectedEvent.id] || []) : []}
        onSendMessage={(message) => selectedEvent && handleSendMessage(selectedEvent.id, message)}
      />
    </section>
  );
}
