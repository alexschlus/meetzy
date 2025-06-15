import { useState } from "react";
import { User } from "lucide-react";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Button } from "@/components/ui/button";

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
        <img
          src={user.avatar}
          alt={user.name}
          className="w-20 h-20 rounded-full border-2 border-blue-300 object-cover shadow"
        />
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 stroke-blue-600" /> {user.name}
            <EditProfileDialog
              current={user}
              onSave={setUser}
            />
          </h1>
          <div className="text-gray-500 text-sm">{user.email}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-lg p-6">
        <h2 className="font-semibold mb-2 text-lg">Profile Details</h2>
        <ul className="text-muted-foreground text-sm space-y-2">
          <li><b>Name:</b> {user.name}</li>
          <li><b>Email:</b> {user.email}</li>
          <li><b>Member since:</b> July 2024</li>
        </ul>
      </div>
    </section>
  );
}

