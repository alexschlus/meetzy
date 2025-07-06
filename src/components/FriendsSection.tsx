
import FriendCard from "./FriendCard";

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
  requester?: Profile;
  addressee?: Profile;
};

type FriendsSectionProps = {
  title: string;
  emptyMessage: string;
  friends: FriendRow[];
  currentUserId?: string;
  type: "accepted" | "incoming" | "outgoing";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  loading?: boolean;
};

export default function FriendsSection({
  title,
  emptyMessage,
  friends,
  currentUserId,
  type,
  onAccept,
  onDecline,
  loading
}: FriendsSectionProps) {
  return (
    <div>
      <h2 className="text-blue-100/80 font-semibold mb-3 text-lg">{title}</h2>
      {friends.length === 0 ? (
        <div className="text-blue-100/60 mb-8">{emptyMessage}</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {friends.map((f: any) => {
            const profile = type === "accepted" 
              ? (f.requester_id === currentUserId ? f.addressee : f.requester)
              : type === "incoming" 
                ? f.requester 
                : f.addressee;
            
            if (!profile) return null;
            
            return (
              <FriendCard
                key={f.id}
                profile={profile}
                type={type}
                onAccept={() => onAccept?.(f.id)}
                onDecline={() => onDecline?.(f.id)}
                loading={loading}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
