
import { Outlet, useLocation, Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";

const TABS = [
  {
    label: "Events",
    path: "/events",
    icon: Calendar,
  },
  {
    label: "Friends",
    path: "/friends",
    icon: User,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
];

export default function BottomTabsLayout() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full bg-background pb-20"> {/* Leaves space for nav */}
        <Outlet />
      </main>
      <nav className="fixed z-30 left-0 right-0 bottom-0 bg-white border-t border-border shadow-sm flex items-stretch justify-center h-20">
        <div className="grid grid-cols-3 w-full max-w-2xl mx-auto h-full">
          {TABS.map((tab, i) => {
            const isActive = location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <Link
                to={tab.path}
                key={tab.label}
                className={`flex flex-col items-center justify-center gap-1 h-full transition-colors
                ${isActive ? "text-blue-600 font-semibold bg-blue-50/60 shadow-inner" : "text-muted-foreground hover:bg-muted/40"}
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={26}
                  className={`mb-1 ${isActive ? "stroke-blue-600" : "stroke-gray-400"} transition-colors`}
                />
                <span className="text-xs">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

