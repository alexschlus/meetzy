
import { useState } from "react";
import { User } from "lucide-react";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const INITIAL_USER = {
  name: "You (Jordan Doe)",
  email: "jordan@email.com",
  avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
};

export default function ProfilePage() {
  const [user, setUser] = useState(INITIAL_USER);

  return (
    <section className="w-full max-w-md mx-auto py-10 px-4">
      <div className="flex items-center gap-5 mb-8">
        <Avatar className="w-20 h-20 border-2 border-blue-400 shadow-glass bg-blue-300/10">
          <AvatarImage
            src={user.avatar}
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
              current={user}
              onSave={setUser}
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
          <li><b>Member since:</b> July 2024</li>
        </ul>
      </div>
    </section>
  );
}
