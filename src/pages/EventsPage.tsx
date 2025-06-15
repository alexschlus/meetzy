
import { Calendar } from "lucide-react";

const events = [
  {
    id: 1,
    title: "🎉 Emily's Birthday Dinner",
    date: "2025-07-16",
    location: "Blue Hill Restaurant",
    attendees: ["You", "Emily", "Mark", "Sarah"],
  },
  {
    id: 2,
    title: "🏖️ Beach Volleyball",
    date: "2025-07-20",
    location: "Brighton Beach",
    attendees: ["You", "Alex", "Taylor"],
  },
  {
    id: 3,
    title: "🕹️ Arcade Night",
    date: "2025-07-22",
    location: "Old Town Arcade",
    attendees: ["You", "Chris"],
  },
];

export default function EventsPage() {
  return (
    <section className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
        <Calendar className="w-8 h-8 stroke-blue-600" /> Upcoming Events
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white shadow rounded-xl p-6 border border-border flex flex-col hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <div className="text-gray-500 mb-1">{event.date} • {event.location}</div>
            <div className="flex flex-wrap gap-2 items-center text-sm mt-2">
              {event.attendees.map(name => (
                <span
                  key={name}
                  className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                >{name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
