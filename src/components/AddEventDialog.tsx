
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Users, MapPin, Clock, Music } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Friend = {
  id: number;
  name: string;
  avatar: string;
};

type AddEventDialogProps = {
  friends: Friend[];
  onAdd: () => void;
};

export default function AddEventDialog({ friends, onAdd }: AddEventDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState("");
  const [invitees, setInvitees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleInvite = (name: string) => {
    setInvitees(invitees =>
      invitees.includes(name)
        ? invitees.filter(n => n !== name)
        : [...invitees, name]
    );
  };

  const validateSpotifyUrl = (url: string) => {
    if (!url) return true; // Empty is valid (optional field)
    const spotifyPlaylistRegex = /^https:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+(\?.*)?$/;
    return spotifyPlaylistRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location || !time || !user) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (spotifyPlaylistUrl && !validateSpotifyUrl(spotifyPlaylistUrl)) {
      toast.error("Please enter a valid Spotify playlist URL");
      return;
    }

    setIsLoading(true);
    
    try {
      // Add current user to attendees list
      const userEmail = user.email || user.id;
      const allAttendees = [userEmail, ...invitees];

      const { error } = await supabase
        .from("events")
        .insert({
          title,
          date: format(date, "yyyy-MM-dd"),
          time,
          location,
          description,
          spotify_playlist_url: spotifyPlaylistUrl || null,
          attendees: allAttendees,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success("Event created successfully!");
      
      // Reset form
      setTitle("");
      setDate(null);
      setTime("");
      setLocation("");
      setDescription("");
      setSpotifyPlaylistUrl("");
      setInvitees([]);
      setOpen(false);
      
      // Trigger refresh
      onAdd();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="lg"
          className="ml-auto mb-3 glass shadow-glass rounded-full font-bold text-lg tracking-wider backdrop-blur-lg border-2 border-blue-400 text-blue-50 hover:bg-blue-500/25 hover:text-white transition-colors"
        >
          + Add Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4 font-playfair">
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
                    className="w-full justify-start text-left font-normal glass text-blue-100/90"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 icon-round bg-blue-400/20 text-blue-400" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass" align="start">
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
              <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-blue-300 icon-round bg-blue-400/20" />
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
              <Music className="h-4 w-4 icon-round bg-green-400/20 text-green-400" /> Spotify Playlist (Optional)
            </label>
            <Input
              placeholder="https://open.spotify.com/playlist/..."
              value={spotifyPlaylistUrl}
              onChange={e => setSpotifyPlaylistUrl(e.target.value)}
              className={spotifyPlaylistUrl && !validateSpotifyUrl(spotifyPlaylistUrl) ? "border-red-500" : ""}
            />
            {spotifyPlaylistUrl && !validateSpotifyUrl(spotifyPlaylistUrl) && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid Spotify playlist URL</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block flex items-center gap-1">
              <Users className="h-4 w-4 icon-round bg-blue-400/20 text-blue-400" /> Invite Friends
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {friends.map(friend => (
                <button
                  type="button"
                  key={friend.id}
                  className={`flex items-center border px-2 py-1 text-sm rounded-full transition-colors glass shadow glass
                    ${invitees.includes(friend.name)
                      ? "bg-blue-400/80 border-blue-400 text-blue-50 shadow-glass"
                      : "bg-gray-600/40 border-gray-600 text-gray-100"}
                    `}
                  onClick={() => handleToggleInvite(friend.name)}
                >
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-5 h-5 rounded-full mr-1 border-2 border-blue-300 bg-glass object-cover"
                  />
                  {friend.name}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="default"
              className="glass border-2 border-blue-400 text-blue-50 font-bold tracking-wide rounded-full shadow-glass"
              disabled={!title || !date || !location || !time || isLoading || (spotifyPlaylistUrl && !validateSpotifyUrl(spotifyPlaylistUrl))}
            >
              {isLoading ? "Creating..." : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
