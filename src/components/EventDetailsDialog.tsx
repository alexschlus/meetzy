
import { useRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";

type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: string[];
};

type Friend = {
  id: number;
  name: string;
  avatar: string;
  status: string;
};

type Message = {
  sender: string;
  text: string;
  timestamp: string;
};

type EventDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  friends: Friend[];
  messages: Message[];
  onSendMessage: (msg: Message) => void;
};

export default function EventDetailsDialog({
  open,
  onOpenChange,
  event,
  friends,
  messages,
  onSendMessage,
}: EventDetailsDialogProps) {
  const [newMsg, setNewMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    // Clear input on event change or open
    setNewMsg("");
  }, [event, open]);

  if (!event) return null;

  // Ensure attendees is always an array
  const safeAttendees = Array.isArray(event.attendees) ? event.attendees : [];

  // Find avatars for attendees
  const attendeeAvatars = safeAttendees.map((name) =>
    friends.find((f) => f.name === name)
  );

  // Demo: User is "You"
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMsg.trim();
    if (!trimmed) return;
    onSendMessage({
      sender: "You",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setNewMsg("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {event.title}
          </DialogTitle>
        </DialogHeader>
        <section className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Date:</span>
              <span className="ml-2">{event.date}</span>
            </div>
            <div className="mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Time:</span>
              <span className="ml-2">{event.time}</span>
            </div>
            <div className="mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Location:</span>
              <span className="ml-2">{event.location}</span>
            </div>
            {event.description && (
              <div className="mb-4">
                <span className="text-sm font-semibold text-muted-foreground">Description:</span>
                <p className="ml-2 text-muted-foreground text-sm">{event.description}</p>
              </div>
            )}
            <div className="mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Attendees:</span>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {attendeeAvatars.map((f, i) => f ? (
                  <img
                    key={f.id}
                    src={f.avatar}
                    className="w-7 h-7 rounded-full border"
                    alt={f.name}
                    title={f.name}
                  />
                ) : (
                  <span
                    className="w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    key={safeAttendees[i]}
                  >
                    {safeAttendees[i] ? safeAttendees[i][0] : "?"}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-2">
                {safeAttendees.map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col h-64">
            <div className="flex items-center gap-2 mb-2 font-bold text-base">
              <span>Group Chat</span>
              <MessageCircle />
            </div>
            <div className="flex-1 bg-muted rounded-md p-2 overflow-y-auto border mb-2">
              {messages.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center pt-6">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 flex ${m.sender === "You" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`rounded px-3 py-1 text-sm ${m.sender === "You"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                      }`}>
                      <span className="font-semibold">{m.sender}:</span> {m.text}
                      <span className="ml-2 text-xs text-gray-400">{m.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Type your message…"
                autoFocus
                className="flex-1"
              />
              <Button type="submit" disabled={!newMsg.trim()}>Send</Button>
            </form>
          </div>
        </section>
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
