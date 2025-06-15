
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const friends = [
  {
    id: 1,
    name: "Emily Johnson",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    status: "Online",
  },
  {
    id: 2,
    name: "Alex Kim",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    status: "Offline",
  },
  {
    id: 3,
    name: "Taylor Lee",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "Online",
  },
  {
    id: 4,
    name: "Sarah Smith",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "Away",
  },
];

export default function FriendsPage() {
  return (
    <section className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-3 text-blue-200">
        <span className="icon-round bg-blue-400/20 shadow-glass"><User className="w-8 h-8 stroke-blue-300" /></span> Friends
      </h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {friends.map(friend => (
          <div key={friend.id} className="flex items-center bg-glass border border-border shadow-glass rounded-2xl p-4 hover:shadow-lg transition-shadow">
            <Avatar className="w-16 h-16 mr-4 border-2 border-blue-400 shadow-glass bg-blue-300/10">
              <AvatarImage
                src={friend.avatar}
                alt={friend.name}
                className="object-cover"
              />
              <AvatarFallback className="text-lg">{friend.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-blue-50">{friend.name}</div>
              <div className={`text-xs font-medium ${
                friend.status === "Online" ? "text-green-400" :
                friend.status === "Offline" ? "text-gray-400" :
                "text-yellow-300"
              }`}>
                {friend.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
