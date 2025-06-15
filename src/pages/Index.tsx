
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background items-center justify-center font-playfair">
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
          onClick={() => navigate("/events", { replace: true })}
        >
          Proceed to meetzy
        </Button>
      </div>
    </div>
  );
};

export default Index;
