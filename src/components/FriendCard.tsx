
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type Profile = {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
};

type FriendCardProps = {
  profile: Profile;
  type: "accepted" | "incoming" | "outgoing";
  onAccept?: () => void;
  onDecline?: () => void;
  loading?: boolean;
};

export default function FriendCard({ profile, type, onAccept, onDecline, loading }: FriendCardProps) {
  return (
    <div className="flex items-center bg-glass border border-border shadow-glass rounded-2xl p-4">
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
        {type === "incoming" && (
          <div className="flex gap-3 mt-2">
            <Button
              onClick={onAccept}
              disabled={loading}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Accept
            </Button>
            <Button
              onClick={onDecline}
              disabled={loading}
              size="sm"
              variant="outline"
              className="border-red-400/50 text-red-300 hover:bg-red-500/20"
            >
              Decline
            </Button>
          </div>
        )}
        {type === "outgoing" && (
          <span className="text-xs text-blue-300 block mt-2">Pending...</span>
        )}
      </div>
    </div>
  );
}
