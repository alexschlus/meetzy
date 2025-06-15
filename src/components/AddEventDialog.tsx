
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Users, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type Friend = {
  id: number;
  name: string;
  avatar: string;
};

type AddEventDialogProps = {
  friends: Friend[];
  onAdd: (event: {
    title: string;
    date: Date | null;
    time: string;
    location: string;
    description: string;
    attendees: string[];
  }) => void;
};

export default function AddEventDialog({ friends, onAdd }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [invitees, setInvitees] = useState<string[]>([]);

  const handleToggleInvite = (name: string) => {
    setInvitees(invitees =>
      invitees.includes(name)
        ? invitees.filter(n => n !== name)
        : [...invitees, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location || !time) return;
    onAdd({ title, date, time, location, description, attendees: invitees });
    setTitle("");
    setDate(null);
    setTime("");
    setLocation("");
    setDescription("");
    setInvitees([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="ml-auto mb-3">
          + Add Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input
              placeholder="Event Name"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Time</label>
              <Input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                className="pl-8"
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Textarea
              placeholder="Event details (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block flex items-center gap-1">
              <Users className="h-4 w-4" /> Invite Friends
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {friends.map(friend => (
                <button
                  type="button"
                  key={friend.id}
                  className={`flex items-center border rounded-full px-2 py-1 text-sm
                    ${invitees.includes(friend.name)
                      ? "bg-blue-100 border-blue-400 text-blue-900"
                      : "bg-gray-100 border-gray-200 text-gray-700"}
                    `}
                  onClick={() => handleToggleInvite(friend.name)}
                >
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-5 h-5 rounded-full mr-1"
                  />
                  {friend.name}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="default" disabled={!title || !date || !location || !time}>
              Add Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
