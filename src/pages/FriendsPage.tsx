
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import UserSelectionDialog from "@/components/UserSelectionDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

type Profile = {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
};

type FriendRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
};

export default function FriendsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch all friend links where current user is involved, join with both profiles
  const { data: friendRows = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("friends")
        .select(
          "*,requester:profiles!requester_id(name,avatar,email,id),addressee:profiles!addressee_id(name,avatar,email,id)"
        )
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Accept a friend request
  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      const { error } = await supabase.from("friends").update({ status: "accepted" }).eq("id", id);
      if (error) throw error;
      setLoading(false);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast({ title: "Friend request accepted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    },
  });

  // Decline (delete) a friend request
  const declineMutation = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      const { error } = await supabase.from("friends").delete().eq("id", id);
      if (error) throw error;
      setLoading(false);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast({ title: "Friend request declined" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    },
  });

  // List requested/accepted/pending friends
  const accepted = friendRows.filter(
    (f: any) =>
      f.status === "accepted" &&
      (f.requester_id === user?.id || f.addressee_id === user?.id)
  );

  const incoming = friendRows.filter(
    (f: any) =>
      f.status === "pending" &&
      f.addressee_id === user?.id
  );

  const outgoing = friendRows.filter(
    (f: any) =>
      f.status === "pending" &&
      f.requester_id === user?.id
  );

  return (
    <section className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-3 text-blue-200">
        <span className="icon-round bg-blue-400/20 shadow-glass">
          <User className="w-8 h-8 stroke-blue-300" />
        </span>{" "}
        Friends
      </h1>
      <div className="flex items-center mb-8 gap-2">
        <UserSelectionDialog onAdd={() => queryClient.invalidateQueries({ queryKey: ["friends"] })} />
      </div>
      {/* Accepted friends */}
      <div>
        <h2 className="text-blue-100/80 font-semibold mb-3 text-lg">Your Friends</h2>
        {accepted.length === 0 ? (
          <div className="text-blue-100/60 mb-8">No friends yet!</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {accepted.map((f: any) => {
              const profile = f.requester_id === user?.id ? f.addressee : f.requester;
              if (!profile) return null;
              return (
                <div key={f.id} className="flex items-center bg-glass border border-border shadow-glass rounded-2xl p-4">
                  <Avatar className="w-16 h-16 mr-4 border-2 border-blue-400 shadow-glass bg-blue-300/10">
                    {profile.avatar ? (
                      <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {profile.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-semibold text-blue-50">{profile.name}</div>
                    <div className="text-xs text-blue-100/70">{profile.email}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Incoming friend requests */}
      <div>
        <h2 className="text-blue-100/80 font-semibold mb-3 text-lg">Pending Friend Requests</h2>
        {incoming.length === 0 ? (
          <div className="text-blue-100/60 mb-8">No pending requests.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {incoming.map((f: any) => {
              const profile = f.requester;
              if (!profile) return null;
              return (
                <div key={f.id} className="flex items-center bg-glass border border-border shadow-glass rounded-2xl p-4">
                  <Avatar className="w-16 h-16 mr-4 border-2 border-blue-400 shadow-glass bg-blue-300/10">
                    {profile.avatar ? (
                      <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {profile.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-blue-50">{profile.name}</div>
                    <div className="text-xs text-blue-100/70">{profile.email}</div>
                    <div className="flex gap-3 mt-2">
                      <Button
                        onClick={() => acceptMutation.mutate(f.id)}
                        disabled={loading}
                        size="sm"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => declineMutation.mutate(f.id)}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Outgoing friend requests */}
      <div>
        <h2 className="text-blue-100/80 font-semibold mb-3 text-lg">Sent Requests</h2>
        {outgoing.length === 0 ? (
          <div className="text-blue-100/60">You have not sent any requests.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {outgoing.map((f: any) => {
              const profile = f.addressee;
              if (!profile) return null;
              return (
                <div key={f.id} className="flex items-center bg-glass border border-border shadow-glass rounded-2xl p-4">
                  <Avatar className="w-16 h-16 mr-4 border-2 border-blue-400 shadow-glass bg-blue-300/10">
                    {profile.avatar ? (
                      <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {profile.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-blue-50">{profile.name}</div>
                    <div className="text-xs text-blue-100/70">{profile.email}</div>
                    <span className="text-xs text-blue-300 block mt-2">Pending...</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
