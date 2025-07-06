
import { User } from "lucide-react";
import UserSelectionDialog from "@/components/UserSelectionDialog";
import FriendsSection from "@/components/FriendsSection";
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
    <section className="max-w-4xl mx-auto py-6 md:py-10 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3 text-blue-200">
        <span className="icon-round bg-blue-400/20 shadow-glass p-2 md:p-3">
          <User className="w-6 h-6 md:w-8 md:h-8 stroke-blue-300" />
        </span>
        Friends
      </h1>
      <div className="flex items-center mb-6 md:mb-8 gap-2">
        <UserSelectionDialog onAdd={() => queryClient.invalidateQueries({ queryKey: ["friends"] })} />
      </div>

      <FriendsSection
        title="Your Friends"
        emptyMessage="No friends yet!"
        friends={accepted}
        currentUserId={user?.id}
        type="accepted"
      />

      <FriendsSection
        title="Pending Friend Requests"
        emptyMessage="No pending requests."
        friends={incoming}
        currentUserId={user?.id}
        type="incoming"
        onAccept={(id) => acceptMutation.mutate(id)}
        onDecline={(id) => declineMutation.mutate(id)}
        loading={loading}
      />

      <FriendsSection
        title="Sent Requests"
        emptyMessage="You have not sent any requests."
        friends={outgoing}
        currentUserId={user?.id}
        type="outgoing"
      />
    </section>
  );
}
