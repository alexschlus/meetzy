
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomTabsLayout from "./layouts/BottomTabsLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EventsPage from "./pages/EventsPage";
import FriendsPage from "./pages/FriendsPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "@/pages/AuthPage";
import ImprintPage from "@/pages/ImprintPage";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="text-blue-100/80 animate-pulse">Checking authentication...</span>
      </div>
    );
  }
  return user ? element : <AuthPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* The landing page "/" does NOT use the BottomTabsLayout */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/imprint" element={<ImprintPage />} />
          {/* All other pages use the layout with the tab bar */}
          <Route element={<BottomTabsLayout />}>
            <Route path="/events" element={<PrivateRoute element={<EventsPage />} />} />
            <Route path="/friends" element={<PrivateRoute element={<FriendsPage />} />} />
            <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
