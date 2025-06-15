
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
  // Force dark mode on mount
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <div className="relative min-h-screen bg-background flex flex-col font-playfair dark">
      <main className="flex-1 w-full bg-background pb-24 md:pb-20 glass transition-all duration-300">
        <Outlet />
      </main>
      <nav className="fixed z-30 left-0 right-0 bottom-0 border-t border-border flex items-stretch justify-center h-20">
        <div className="grid grid-cols-3 w-full max-w-2xl mx-auto h-full">
          {TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <Link
                to={tab.path}
                key={tab.label}
                className={`
                  flex flex-col items-center justify-center gap-1 h-full transition-colors 
                  ${isActive ? "text-blue-300 font-bold bg-glass/80 shadow-inner glass" : "text-gray-300 hover:bg-glass/40"}
                  rounded-full mx-2 my-3 overflow-hidden
                  `}
                aria-current={isActive ? "page" : undefined}
                style={{
                  boxShadow: isActive ? "0 2px 12px 3px rgba(71,120,255,0.10)" : undefined,
                }}
              >
                <span className="icon-round" style={{background: isActive ? "rgba(95,135,255,0.14)" : "rgba(40,40,54,0.16)"}}>
                  <Icon
                    size={28}
                    className={`mb-1 ${isActive ? "stroke-blue-200" : "stroke-blue-400"} transition-colors`}
                  />
                </span>
                <span className="text-xs mt-1 drop-shadow-sm">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

