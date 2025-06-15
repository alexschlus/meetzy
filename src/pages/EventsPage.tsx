
import { Calendar } from "lucide-react";
import { useState } from "react";
import AddEventDialog from "@/components/AddEventDialog";
import EventDetailsDialog from "@/components/EventDetailsDialog";

// Demo friends for inviting
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

// Initial (demo) events
const initialEvents = [
  {
    id: 1,
    title: "🎉 Emily's Birthday Dinner",
    date: "2025-07-16",
    time: "19:30",
    location: "Blue Hill Restaurant",
    description: "",
    attendees: ["You", "Emily", "Mark", "Sarah"],
  },
  {
    id: 2,
    title: "🏖️ Beach Volleyball",
    date: "2025-07-20",
    time: "17:00",
    location: "Brighton Beach",
    description: "",
    attendees: ["You", "Alex", "Taylor"],
  },
  {
    id: 3,
    title: "🕹️ Arcade Night",
    date: "2025-07-22",
    time: "20:00",
    location: "Old Town Arcade",
    description: "",
    attendees: ["You", "Chris"],
  },
];

type Message = {
  sender: string;
  text: string;
  timestamp: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<typeof initialEvents[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // NEW: Map of eventId to messages array
  const [eventMessages, setEventMessages] = useState<Record<number, Message[]>>({});

  // Handler to add new event from dialog
  const handleAddEvent = (event: {
    title: string;
    date: Date | null;
    time: string;
    location: string;
    description: string;
    attendees: string[];
  }) => {
    if (!event.date) return;
    const newId = Math.max(0, ...events.map(e => (typeof e.id === "number" ? e.id : 0))) + 1;
    setEvents(prev => [
      {
        ...event,
        id: newId,
        // Store as ISO date string for consistency
        date: event.date.toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    // Optionally, initialize chat for new event
    setEventMessages(prev => ({
      ...prev,
      [newId]: [],
    }));
  };

  const handleEventClick = (event: typeof initialEvents[0]) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  // Handler for sending message in event chat
  const handleSendMessage = (eventId: number, msg: Message) => {
    setEventMessages(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), msg],
    }));
  };

  // Helper: Render title with colored icon/emote
  function renderEventTitle(title: string) {
    // Try to split at first whitespace to separate emoji/icon (if present)
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
    // No lead emoji, just render text
    return <span className="text-blue-50">{title}</span>;
  }

  return (
    <section className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-blue-200">
          <Calendar className="w-8 h-8 stroke-blue-300 bg-blue-400/20 rounded-full p-1 shadow-glass" /> Upcoming Events
        </h1>
        <AddEventDialog
          friends={friends}
          onAdd={handleAddEvent}
        />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
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
              {event.attendees.map(name => (
                <span
                  key={name}
                  className="bg-blue-300/30 text-blue-100 px-2 py-0.5 rounded-full"
                >
                  {name}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
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
