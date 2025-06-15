import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col font-playfair relative">
      <header className="absolute left-0 top-0 p-4">
        <Logo />
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-glass rounded-2xl p-10 w-full max-w-xl shadow-glass flex flex-col items-center gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-200 mb-2 text-center drop-shadow-sm">meetzy</h1>
            <p className="text-lg md:text-xl text-gray-200 text-center font-medium mb-4">
              Your Friends. Your Plans. One App.
            </p>
          </div>
          <Button
            variant="default"
            className="px-8 py-3 rounded-full font-bold text-blue-50 text-lg glass border-2 border-blue-400 shadow-glass hover:bg-blue-400/30 hover:text-white transition"
            onClick={() => navigate(user ? "/events" : "/auth", { replace: true })}
            disabled={loading}
          >
            {user ? "Go to meetzy" : "Sign in / Sign up"}
          </Button>
          {!user && !loading && (
            <Button
              variant="outline"
              className="px-8 py-3 rounded-full font-bold text-blue-50 text-lg glass border-2 border-blue-400 shadow-glass"
              onClick={() => navigate("/auth")}
            >
              Login / Register
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
