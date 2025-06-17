
import { Calendar, MapPin, Clock, Plus, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AddEventDialog from "@/components/AddEventDialog";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

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

  // Helper function to check if an event is expired
  const isEventExpired = (event: SupabaseEvent) => {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    return eventDateTime < new Date();
  };

  // Filter events into active and expired
  const activeEvents = events.filter(event => !isEventExpired(event));
  const expiredEvents = events.filter(event => isEventExpired(event));

  // Check if user is the owner of the event
  const isEventOwner = (event: SupabaseEvent) => {
    return event.user_id === user?.id;
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast.success("Event deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleLeaveEvent = async (event: SupabaseEvent) => {
    try {
      const currentAttendees = Array.isArray(event.attendees) ? event.attendees : [];
      const userProfile = user?.email || user?.id || "You";
      const updatedAttendees = currentAttendees.filter(attendee => attendee !== userProfile);

      const { error } = await supabase
        .from("events")
        .update({ attendees: updatedAttendees })
        .eq("id", event.id);

      if (error) throw error;

      toast.success("Left event successfully");
      refetch();
    } catch (error) {
      console.error("Error leaving event:", error);
      toast.error("Failed to leave event");
    }
  };

  const renderEventCard = (event: SupabaseEvent, isExpired = false) => (
    <Card
      key={event.id}
      className={`bg-glass border border-border shadow-glass rounded-2xl ${isExpired ? 'opacity-60' : ''}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-blue-50 font-bold">{event.title}</CardTitle>
            <CardDescription className="text-blue-100/70">
              {event.date} - {event.time}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isEventOwner(event) ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{event.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleLeaveEvent(event)}
                className="text-orange-400 hover:text-orange-300"
              >
                Leave
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-blue-100/90 mb-4">{event.description}</div>
        <div className="flex items-center gap-2 text-blue-100/70 mb-4">
          <MapPin className="w-4 h-4" />
          {event.location || "No location specified"}
        </div>
        {isExpired && (
          <div className="text-red-400 text-sm mb-2 font-medium">
            Event Expired
          </div>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSelectedEvent(event)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <section className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-3 text-blue-200">
        <span className="icon-round bg-blue-400/20 shadow-glass">
          <Calendar className="w-8 h-8 stroke-blue-300" />
        </span>
        Events
      </h1>
      <div className="flex items-center mb-8 gap-2">
        <AddEventDialog friends={mockFriends} onAdd={() => refetch()} />
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Active Events Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-200">Active Events</h2>
            {activeEvents.length === 0 ? (
              <div className="text-blue-100/60">No active events!</div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {activeEvents.map((event) => renderEventCard(event))}
              </div>
            )}
          </div>

          {/* Expired Events Section */}
          {expiredEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-blue-200">Expired Events</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {expiredEvents.map((event) => renderEventCard(event, true))}
              </div>
            </div>
          )}
        </>
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
