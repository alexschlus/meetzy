
import { useState } from "react";
import { User } from "lucide-react";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, updateProfile, signOut, loading } = useAuth();
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();

  if (!user && !loading) {
    navigate("/auth", { replace: true });
    return null;
  }
  if (!user) {
    // Still loading profile
    return (
      <section className="w-full max-w-md mx-auto py-10 px-4 flex items-center justify-center">
        <span className="text-blue-100/70 animate-pulse">Loading profile...</span>
      </section>
    );
  }

  const handleSave = async (data: { name: string; email: string; avatar: string }) => {
    setEditLoading(true);
    const { error } = await updateProfile(data);
    if (!error) {
      toast({ title: "Profile updated", description: "Your profile information has been updated." });
    } else {
      const description =
        typeof error === "string"
          ? error
          : error?.message || "Could not update profile";
      toast({ title: "Update failed", description, variant: "destructive" });
    }
    setEditLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <section className="w-full max-w-md mx-auto py-10 px-4">
      <div className="flex items-center gap-5 mb-8">
        <Avatar className="w-20 h-20 border-2 border-blue-400 shadow-glass bg-blue-300/10">
          <AvatarImage
            src={user.avatar || ""}
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-200">
            <span className="icon-round bg-blue-400/20 shadow-glass">
              <User className="w-6 h-6 stroke-blue-300" />
            </span>
            {user.name}
            <EditProfileDialog
              current={{ name: user.name, email: user.email, avatar: user.avatar || "" }}
              onSave={handleSave}
              loading={editLoading}
            />
          </h1>
          <div className="text-blue-100/80 text-sm">{user.email}</div>
        </div>
      </div>
      <div className="bg-glass rounded-2xl border border-border shadow-glass p-6">
        <h2 className="font-semibold mb-2 text-lg text-blue-100">Profile Details</h2>
        <ul className="text-blue-100/80 text-sm space-y-2">
          <li><b>Name:</b> {user.name}</li>
          <li><b>Email:</b> {user.email}</li>
          <li><b>Member since:</b> {new Date(user.created_at).toLocaleString()}</li>
        </ul>
      </div>
      <div className="mt-8 text-center">
        <Button variant="outline" className="rounded-full px-6" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </section>
  );
}
