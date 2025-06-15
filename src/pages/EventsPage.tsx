
import { Calendar } from "lucide-react";
import { useState } from "react";
import AddEventDialog from "@/components/AddEventDialog";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Demo friends for inviting (not stored in Supabase, for now)
const friends = [
  {
    id: 1,
    name: "Emily Johnson",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    status: "Online",
  },
  {
    id: 2,
    name: "Alex Kim",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    status: "Offline",
  },
  {
    id: 3,
    name: "Taylor Lee",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "Online",
  },
  {
    id: 4,
    name: "Sarah Smith",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "Away",
  },
];

// Type for fetching from Supabase (corresponds to new table)
type SupabaseEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string | null;
  description: string | null;
  attendees: string[]; // stored as jsonb string[]
  created_at: string;
  updated_at: string;
  user_id: string;
};

type Message = {
  sender: string;
  text: string;
  timestamp: string;
};

export default function EventsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State for event details dialog and chat
  const [selectedEvent, setSelectedEvent] = useState<SupabaseEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Local map: eventId -> messages (for demo chat)
  const [eventMessages, setEventMessages] = useState<Record<string, Message[]>>({});

  // Fetch all events for this user
  const {
    data: events,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      // attendees is json, ensure string[] or []
      return (
        data?.map((e) => ({
          ...e,
          attendees: Array.isArray(e.attendees) ? e.attendees : [],
        })) ?? []
      );
    },
    enabled: !!user,
  });

  // Mutation for adding a new event
  const addEventMutation = useMutation({
    mutationFn: async (event: {
      title: string;
      date: Date | null;
      time: string;
      location: string;
      description: string;
      attendees: string[];
    }) => {
      if (!user) throw new Error("Not authenticated");
      if (!event.date) throw new Error("No date");
      const eventData = {
        user_id: user.id,
        title: event.title,
        date: event.date.toISOString().slice(0, 10),
        time: event.time,
        location: event.location,
        description: event.description || "",
        attendees: event.attendees, // stores as jsonb
      };
      const { data, error } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Event added", description: "Your event was created!" });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error: any) => {
      toast({ title: "Could not add event", description: error.message, variant: "destructive" });
    },
  });

  // Add new event handler, triggers Supabase insert
  const handleAddEvent = (event: {
    title: string;
    date: Date | null;
    time: string;
    location: string;
    description: string;
    attendees: string[];
  }) => {
    addEventMutation.mutate(event);
  };

  const handleEventClick = (event: SupabaseEvent) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  // Handler for sending message in event chat (local only)
  const handleSendMessage = (eventId: string, msg: Message) => {
    setEventMessages((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), msg],
    }));
  };

  // Helper: Render title with colored icon/emote
  function renderEventTitle(title: string) {
    const match = title.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s?(.+)$/u);
    if (match) {
      return (
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-blue-400/20 text-blue-200 px-2 py-1 text-xl shadow-glass">
            {match[1]}
          </span>
          <span className="text-blue-50">{match[2]}</span>
        </span>
      );
    }
    return <span className="text-blue-50">{title}</span>;
  }

  return (
    <section className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-blue-200">
          <Calendar className="w-8 h-8 stroke-blue-300 bg-blue-400/20 rounded-full p-1 shadow-glass" /> Upcoming Events
        </h1>
        <AddEventDialog friends={friends} onAdd={handleAddEvent} />
      </div>
      {/* Handle loading and errors */}
      {isLoading ? (
        <div className="text-blue-100/60 p-10 text-center">Loading your events...</div>
      ) : isError ? (
        <div className="text-red-500 p-10 text-center">Error: {error.message}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events && events.length > 0 ? events.map((event) => (
            <button
              key={event.id}
              className="bg-glass border border-border shadow-glass rounded-3xl p-6 flex flex-col hover:shadow-lg transition-shadow text-left focus:outline-none"
              onClick={() => handleEventClick(event)}
              tabIndex={0}
            >
              <h2 className="text-xl font-semibold mb-1">
                {renderEventTitle(event.title)}
              </h2>
              <div className="text-blue-100/80 mb-1">
                <span>{event.date}</span>
                {event.time && (
                  <span> • {event.time}</span>
                )}
                {event.location && (
                  <span> • {event.location}</span>
                )}
              </div>
              {event.description && (
                <div className="mb-2 text-sm text-blue-100/70">{event.description}</div>
              )}
              <div className="flex flex-wrap gap-2 items-center text-sm mt-2">
                {Array.isArray(event.attendees) && event.attendees.map(name => (
                  <span
                    key={name}
                    className="bg-blue-300/30 text-blue-100 px-2 py-0.5 rounded-full"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </button>
          )) : (
            <span className="text-blue-100/60 p-10 col-span-full text-center">No events yet.</span>
          )}
        </div>
      )}
      {/* Details dialog (chat stays local for now) */}
      <EventDetailsDialog
        open={detailsOpen}
        onOpenChange={open => setDetailsOpen(open)}
        event={selectedEvent}
        friends={friends}
        messages={selectedEvent && selectedEvent.id ? (eventMessages[selectedEvent.id] || []) : []}
        onSendMessage={(msg) => {
          if (selectedEvent && selectedEvent.id) handleSendMessage(selectedEvent.id, msg);
        }}
      />
    </section>
  );
}
