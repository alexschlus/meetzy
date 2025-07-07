
import { Calendar, MapPin, Clock, Check, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type EventInvitation = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string | null;
  user_id: string;
  invitation_responses: any;
  invited_users: any;
  profiles?: {
    name: string;
  };
};

type EventInvitationCardProps = {
  event: EventInvitation;
  onUpdate: () => void;
};

export default function EventInvitationCard({ event, onUpdate }: EventInvitationCardProps) {
  const { user } = useAuth();

  const handleInvitationResponse = async (response: 'accepted' | 'declined') => {
    if (!user) return;

    try {
      const currentResponses = event.invitation_responses || {};
      const updatedResponses = {
        ...currentResponses,
        [user.id]: response
      };

      const { error } = await supabase
        .from("events")
        .update({ invitation_responses: updatedResponses })
        .eq("id", event.id);

      if (error) throw error;

      toast.success(`Invitation ${response}`);
      onUpdate();
    } catch (error) {
      console.error("Error responding to invitation:", error);
      toast.error("Failed to respond to invitation");
    }
  };

  return (
    <Card className="bg-glass border border-border shadow-glass rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-blue-50 font-bold">{event.title}</CardTitle>
            <CardDescription className="text-blue-100/70">
              {format(new Date(event.date), "dd/MM/yyyy")} - {event.time}
            </CardDescription>
            {event.profiles && (
              <div className="flex items-center gap-2 mt-1 text-sm text-blue-100/60">
                <User className="w-3 h-3" />
                Invited by {event.profiles.name}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {event.description && (
          <div className="text-blue-100/90 text-sm">{event.description}</div>
        )}
        
        <div className="flex items-center gap-2 text-blue-100/70 text-sm">
          <MapPin className="w-4 h-4" />
          {event.location || "No location specified"}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleInvitationResponse('accepted')}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleInvitationResponse('declined')}
            className="flex-1 border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
