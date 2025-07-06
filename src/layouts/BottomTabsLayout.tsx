
import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Calendar, User, MapPin } from "lucide-react";
import Logo from "@/components/Logo";

const TABS = [
  {
    label: "Events",
    path: "/events",
    icon: Calendar,
  },
  {
    label: "Map",
    path: "/map",
    icon: MapPin,
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
      {/* Logo top left - better mobile positioning */}
      <header className="absolute left-0 top-0 p-2 md:p-4 z-40">
        <Logo />
      </header>
      <main className="flex-1 w-full bg-background pb-20 md:pb-24 glass transition-all duration-300 pt-16 md:pt-0">
        <Outlet />
      </main>
      <nav className="fixed z-30 left-0 right-0 bottom-0 md:bottom-4 border-t border-border flex items-stretch justify-center h-16 md:h-16 bg-background md:bg-transparent">
        <div className="grid grid-cols-4 w-full max-w-full md:max-w-2xl mx-auto h-full">
          {TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <Link
                to={tab.path}
                key={tab.label}
                className={`
                  flex flex-col items-center justify-center gap-0.5 md:gap-1 h-full transition-colors 
                  ${isActive ? "text-blue-300 font-bold bg-glass/80 shadow-inner glass" : "text-gray-300 hover:bg-glass/40"}
                  rounded-none md:rounded-full mx-0 md:mx-2 my-0 md:my-2 overflow-hidden
                  `}
                aria-current={isActive ? "page" : undefined}
                style={{
                  boxShadow: isActive ? "0 2px 12px 3px rgba(71,120,255,0.10)" : undefined,
                }}
              >
                <span className="icon-round p-1 md:p-2" style={{background: isActive ? "rgba(95,135,255,0.14)" : "rgba(40,40,54,0.16)"}}>
                  <Icon
                    size={20}
                    className={`${isActive ? "stroke-blue-200" : "stroke-blue-400"} transition-colors`}
                  />
                </span>
                <span className="text-xs mt-0.5 md:mt-1 drop-shadow-sm">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
