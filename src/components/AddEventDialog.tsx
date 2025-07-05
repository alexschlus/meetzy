
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
import TimePickerDialog from "./TimePickerDialog";

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
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState("");
  const [invitees, setInvitees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValid, setAddressValid] = useState<boolean | null>(null);

  const handleToggleInvite = (name: string) => {
    setInvitees(invitees =>
      invitees.includes(name)
        ? invitees.filter(n => n !== name)
        : [...invitees, name]
    );
  };

  const validateSpotifyUrl = (url: string) => {
    if (!url.trim()) return true; // Empty is valid (optional field)
    const spotifyPlaylistRegex = /^https:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+(\?.*)?$/;
    return spotifyPlaylistRegex.test(url);
  };

  const validateAddress = async (address: string) => {
    if (!address.trim()) {
      setAddressValid(null);
      return;
    }

    // Check if address has at least a street number and name pattern
    const streetPattern = /\d+\s+[A-Za-z\s]+/;
    if (!streetPattern.test(address.trim())) {
      setAddressValid(false);
      return;
    }

    setIsValidatingAddress(true);
    try {
      // Use a geocoding service to validate the address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        // Check if the result has proper address components (house number and street)
        if (result.address && (result.address.house_number || result.address.street_number) && result.address.road) {
          setAddressValid(true);
        } else {
          setAddressValid(false);
        }
      } else {
        setAddressValid(false);
      }
    } catch (error) {
      console.error("Address validation error:", error);
      setAddressValid(false);
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    // Debounce address validation
    const timeoutId = setTimeout(() => {
      validateAddress(value);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  };

  // Check if all required fields are filled and address is valid
  const hasRequiredFields = Boolean(title.trim() && date && location.trim() && time.trim() && user);
  const hasValidSpotifyUrl = validateSpotifyUrl(spotifyPlaylistUrl);
  const isFormValid = hasRequiredFields && hasValidSpotifyUrl && addressValid === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addressValid) {
      toast.error("Please enter a valid address for the location");
      return;
    }
    
    if (!isFormValid) {
      toast.error("Please fill in all required fields with valid information");
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
          date: format(date!, "yyyy-MM-dd"),
          time,
          location,
          description,
          spotify_playlist_url: spotifyPlaylistUrl.trim() || null,
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
      setAddressValid(null);
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
    <>
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
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input
                placeholder="Event Name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal glass text-blue-100/90"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 icon-round bg-blue-400/20 text-blue-400" />
                      {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
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
                <label className="text-sm font-medium mb-1 block">Time (24h format) *</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTimePickerOpen(true)}
                  className="w-full justify-start text-left font-normal glass text-blue-100/90"
                >
                  <Clock className="mr-2 h-4 w-4 icon-round bg-blue-400/20 text-blue-400" />
                  {time ? time : <span>Pick a time</span>}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Location (Full Address Required) *</label>
              <div className="relative">
                <MapPin className={`absolute left-2 top-2.5 h-4 w-4 icon-round ${
                  addressValid === true ? 'text-green-400 bg-green-400/20' :
                  addressValid === false ? 'text-red-400 bg-red-400/20' :
                  'text-blue-300 bg-blue-400/20'
                }`} />
                <Input
                  className={`pl-8 ${
                    addressValid === false ? 'border-red-500' :
                    addressValid === true ? 'border-green-500' : ''
                  }`}
                  placeholder="Street Address, City, Country"
                  value={location}
                  onChange={e => handleLocationChange(e.target.value)}
                  required
                />
                {isValidatingAddress && (
                  <div className="absolute right-2 top-2.5">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              {addressValid === false && (
                <p className="text-red-500 text-xs mt-1">Please enter a valid, complete address</p>
              )}
              {addressValid === true && (
                <p className="text-green-500 text-xs mt-1">Address validated ✓</p>
              )}
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
              {friends.length === 0 ? (
                <p className="text-blue-200/60 text-sm mt-1">No friends to invite yet. Add some friends first!</p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {friends.map(friend => (
                    <button
                      type="button"
                      key={friend.id}
                      className={`flex items-center border px-3 py-2 text-sm rounded-full transition-all duration-200 glass shadow-glass
                        ${invitees.includes(friend.name)
                          ? "bg-blue-500/90 border-blue-400 text-white shadow-lg scale-105" 
                          : "bg-blue-900/40 border-blue-600/50 text-blue-100 hover:bg-blue-800/50 hover:border-blue-500"}
                        `}
                      onClick={() => handleToggleInvite(friend.name)}
                    >
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-5 h-5 rounded-full mr-2 border-2 border-blue-300 bg-glass object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full mr-2 border-2 border-blue-300 bg-blue-400/20 flex items-center justify-center text-xs font-bold text-blue-300">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {friend.name}
                    </button>
                  ))}
                </div>
              )}
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
                disabled={!isFormValid || isLoading || isValidatingAddress}
              >
                {isLoading ? "Creating..." : "Add Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <TimePickerDialog
        open={timePickerOpen}
        onOpenChange={setTimePickerOpen}
        value={time}
        onChange={setTime}
      />
    </>
  );
}
