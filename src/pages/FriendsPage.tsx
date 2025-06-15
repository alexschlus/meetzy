
import { User } from "lucide-react";

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
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
        <User className="w-8 h-8 stroke-blue-600" /> Friends
      </h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {friends.map(friend => (
          <div key={friend.id} className="flex items-center bg-white border border-border shadow rounded-xl p-4 hover:shadow-lg transition-shadow">
            <img
              src={friend.avatar}
              alt={friend.name}
              className="w-14 h-14 rounded-full object-cover mr-4 border border-blue-100"
            />
            <div>
              <div className="font-semibold">{friend.name}</div>
              <div className={`text-xs font-medium ${
                friend.status === "Online" ? "text-green-600" :
                friend.status === "Offline" ? "text-gray-400" :
                "text-yellow-500"
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
