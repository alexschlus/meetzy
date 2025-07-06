
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center bg-glass border border-border shadow-glass rounded-2xl p-3 md:p-4 space-y-3 sm:space-y-0">
      <Avatar className="w-12 h-12 md:w-16 md:h-16 sm:mr-4 border-2 border-blue-400 shadow-glass bg-blue-300/10 mx-auto sm:mx-0">
        {profile.avatar ? (
          <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
        ) : (
          <AvatarFallback className="text-sm md:text-lg">
            {profile.name?.charAt(0) ?? "?"}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
        <div className="font-semibold text-blue-50 text-sm md:text-base">{profile.name}</div>
        <div className="text-xs text-blue-100/70">{profile.email}</div>
        {type === "incoming" && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 w-full sm:w-auto">
            <Button
              onClick={onAccept}
              disabled={loading}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white text-xs w-full sm:w-auto"
            >
              Accept
            </Button>
            <Button
              onClick={onDecline}
              disabled={loading}
              size="sm"
              variant="outline"
              className="border-red-400/50 text-red-300 hover:bg-red-500/20 text-xs w-full sm:w-auto"
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
