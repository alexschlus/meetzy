
import { useState, useMemo } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, User, RefreshCw } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

export default function UserSelectionDialog({ onAdd }: { onAdd?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter profiles based on search query
  const filteredProfiles = useMemo(() => {
    console.log("Filtering profiles:", profiles, "with query:", searchQuery);
    if (!searchQuery.trim()) return profiles;
    return profiles.filter(profile =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profiles, searchQuery]);

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
        setSearchQuery("");
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
        
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Refresh button */}
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <span className="text-xs text-muted-foreground">
              Found: {profiles.length} users
            </span>
          </div>

          {/* User list */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-destructive">Error loading users: {error.message}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No users found matching your search" : "No other users available"}
                </p>
                {profiles.length === 0 && (
                  <div className="mt-2 text-xs text-destructive">
                    <p>Try refreshing to load users</p>
                  </div>
                )}
              </div>
            ) : (
              filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 bg-glass border border-border shadow-glass rounded-2xl hover:bg-glass-light transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-blue-400/30 shadow-glass">
                      {profile.avatar ? (
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                      ) : (
                        <AvatarFallback className="bg-blue-400/20 text-blue-100">
                          {profile.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-blue-50">{profile.name}</p>
                      <p className="text-xs text-blue-100/70">{profile.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendFriendRequest(profile)}
                    disabled={loading}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

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
