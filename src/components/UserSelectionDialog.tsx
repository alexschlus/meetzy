
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";
import UserSearch from "./UserSearch";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

export default function UserSelectionDialog({ onAdd }: { onAdd?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all profiles except current user
  const { data: profiles = [], isLoading, error, refetch } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      console.log("=== FETCHING PROFILES DEBUG ===");
      console.log("Current user:", user);
      
      if (!user) {
        console.log("No user found, returning empty array");
        return [];
      }
      
      // Get profiles excluding current user
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, avatar")
        .neq("id", user.id)
        .order("name");
        
      console.log("Profiles query result:", { data, error });
      console.log("User ID being excluded:", user.id);
      
      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
      
      console.log("Final profiles to return:", data);
      return data || [];
    },
    enabled: !!user && open,
  });

  const handleSendFriendRequest = async (selectedProfile: Profile) => {
    setLoading(true);
    
    try {
      console.log("Sending friend request to:", selectedProfile);

      const requesterId = user?.id;
      if (!requesterId) {
        toast({ title: "Not authenticated", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Check if friendship already exists (in either direction)
      const { data: existingFriendship } = await supabase
        .from("friends")
        .select("id, status")
        .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${selectedProfile.id}),and(requester_id.eq.${selectedProfile.id},addressee_id.eq.${requesterId})`)
        .maybeSingle();

      if (existingFriendship) {
        if (existingFriendship.status === "accepted") {
          toast({
            title: "Already friends",
            description: "You are already friends with this user.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Friend request already exists",
            description: "A friend request already exists between you and this user.",
            variant: "destructive"
          });
        }
        setLoading(false);
        return;
      }

      // Create friend request
      const { error } = await supabase.from("friends").insert({
        requester_id: requesterId,
        addressee_id: selectedProfile.id,
        status: "pending",
      });

      if (error) {
        console.error("Friend request error:", error);
        toast({
          title: "Error sending request",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: `Friend request sent to ${selectedProfile.name}!` });
        onAdd?.();
        setOpen(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    refetch();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">Add Friend</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Add New Friend
          </DialogTitle>
        </DialogHeader>
        
        <UserSearch
          profiles={profiles}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          onAddUser={handleSendFriendRequest}
          loading={loading}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
