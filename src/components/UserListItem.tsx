
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

type UserListItemProps = {
  profile: Profile;
  onAdd: (profile: Profile) => void;
  loading: boolean;
};

export default function UserListItem({ profile, onAdd, loading }: UserListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-glass border border-border shadow-glass rounded-2xl hover:bg-glass-light transition-all duration-200">
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
        onClick={() => onAdd(profile)}
        disabled={loading}
        className="text-xs bg-blue-500 hover:bg-blue-600 text-white"
      >
        Add
      </Button>
    </div>
  );
}
