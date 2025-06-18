
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type PollResponse = {
  user_id: string;
  user_email: string;
  response: "yes" | "no" | "maybe";
  timestamp: string;
};

type EventAttendancePollProps = {
  eventId: string;
  pollResponses: PollResponse[];
  onUpdate: () => void;
};

export default function EventAttendancePoll({ eventId, pollResponses, onUpdate }: EventAttendancePollProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const userResponse = pollResponses.find(response => response.user_id === user?.id);

  const handleVote = async (response: "yes" | "no" | "maybe") => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userEmail = user.email || user.id;
      const newResponse = {
        user_id: user.id,
        user_email: userEmail,
        response,
        timestamp: new Date().toISOString(),
      };

      // Remove existing response from user if any
      const updatedResponses = pollResponses.filter(r => r.user_id !== user.id);
      // Add new response
      updatedResponses.push(newResponse);

      const { error } = await supabase
        .from("events")
        .update({ poll_responses: updatedResponses })
        .eq("id", eventId);

      if (error) throw error;

      toast.success("Your response has been recorded!");
      onUpdate();
    } catch (error) {
      console.error("Error updating poll response:", error);
      toast.error("Failed to record your response");
    } finally {
      setIsLoading(false);
    }
  };

  const getResponseCounts = () => {
    const yes = pollResponses.filter(r => r.response === "yes").length;
    const no = pollResponses.filter(r => r.response === "no").length;
    const maybe = pollResponses.filter(r => r.response === "maybe").length;
    return { yes, no, maybe };
  };

  const counts = getResponseCounts();

  return (
    <Card className="bg-glass border border-border shadow-glass rounded-xl">
      <CardHeader>
        <CardTitle className="text-blue-50 text-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Can you attend?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={userResponse?.response === "yes" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("yes")}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Yes ({counts.yes})
            </Button>
            <Button
              variant={userResponse?.response === "no" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("no")}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              No ({counts.no})
            </Button>
            <Button
              variant={userResponse?.response === "maybe" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("maybe")}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Maybe ({counts.maybe})
            </Button>
          </div>
          {userResponse && (
            <p className="text-blue-100/70 text-sm">
              Your response: <span className="font-semibold capitalize">{userResponse.response}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
