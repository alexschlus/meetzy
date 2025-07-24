
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
  showDetails?: boolean;
  eventCreatorId: string;
};

export default function EventAttendancePoll({ eventId, pollResponses, onUpdate, showDetails = false, eventCreatorId }: EventAttendancePollProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const userResponse = pollResponses.find(response => response.user_id === user?.id);
  const isEventCreator = user?.id === eventCreatorId;

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
      // Trigger immediate refresh to show updated poll results
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

  const getResponsesByType = () => {
    const yes = pollResponses.filter(r => r.response === "yes");
    const no = pollResponses.filter(r => r.response === "no");
    const maybe = pollResponses.filter(r => r.response === "maybe");
    return { yes, no, maybe };
  };

  const counts = getResponseCounts();
  const responsesByType = getResponsesByType();

  return (
    <Card className="bg-glass border border-border shadow-glass rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-50 text-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Can you attend?
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {isEventCreator ? (
            <div className="text-center py-4">
              <p className="text-blue-100/70 text-sm">
                As the event creator, you cannot participate in the poll.
              </p>
              <p className="text-blue-50 text-sm mt-2 font-medium">
                Poll Results: {counts.yes + counts.no + counts.maybe} responses
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant={userResponse?.response === "yes" ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote("yes")}
                disabled={isLoading}
                className="flex items-center justify-start gap-2 w-full"
              >
                <CheckCircle className="w-4 h-4" />
                Yes ({counts.yes})
              </Button>
              <Button
                variant={userResponse?.response === "no" ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote("no")}
                disabled={isLoading}
                className="flex items-center justify-start gap-2 w-full"
              >
                <XCircle className="w-4 h-4" />
                No ({counts.no})
              </Button>
              <Button
                variant={userResponse?.response === "maybe" ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote("maybe")}
                disabled={isLoading}
                className="flex items-center justify-start gap-2 w-full"
              >
                <HelpCircle className="w-4 h-4" />
                Maybe ({counts.maybe})
              </Button>
            </div>
          )}
          {!isEventCreator && userResponse && (
            <p className="text-blue-100/70 text-sm">
              Your response: <span className="font-semibold capitalize">{userResponse.response}</span>
            </p>
          )}
          
          {showDetails && pollResponses.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <h4 className="text-blue-50 font-semibold text-sm">Poll Results:</h4>
              
              {responsesByType.yes.length > 0 && (
                <div>
                  <p className="text-green-400 font-medium text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    YES:
                  </p>
                  <p className="text-blue-100/80 text-sm ml-4">
                    {responsesByType.yes.map(r => r.user_email.split('@')[0]).join(', ')}
                  </p>
                </div>
              )}
              
              {responsesByType.no.length > 0 && (
                <div>
                  <p className="text-red-400 font-medium text-sm flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    NO:
                  </p>
                  <p className="text-blue-100/80 text-sm ml-4">
                    {responsesByType.no.map(r => r.user_email.split('@')[0]).join(', ')}
                  </p>
                </div>
              )}
              
              {responsesByType.maybe.length > 0 && (
                <div>
                  <p className="text-yellow-400 font-medium text-sm flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    MAYBE:
                  </p>
                  <p className="text-blue-100/80 text-sm ml-4">
                    {responsesByType.maybe.map(r => r.user_email.split('@')[0]).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
