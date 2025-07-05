
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<"login" | "signup" | "landing">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // for signup
  const [submitting, setSubmitting] = useState(false);

  // Redirect to home if already logged in
  if (user && !loading) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    if (view === "login") {
      const error = await signIn(email, password);
      if (error) toast({ title: "Login failed", description: error.message || "Invalid credentials", variant: "destructive" });
      else window.location.href = "/";
    } else {
      if (!name.trim()) {
        toast({ title: "Name required", description: "Please enter your name.", variant: "destructive"});
        setSubmitting(false);
        return;
      }
      const error = await signUp(name, email, password);
      if (error) toast({ title: "Sign up failed", description: error.message || "Could not sign up", variant: "destructive" });
      else {
        toast({ title: "Check your email", description: "Click the link in the email we sent to finish registration."});
        setView("login");
      }
    }
    setSubmitting(false);
  }

  // Landing page with two buttons
  if (view === "landing") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background font-playfair relative">
        <Logo />
        <div className="bg-glass mt-6 p-8 rounded-2xl w-full max-w-md shadow-glass border border-border">
          <h1 className="text-2xl font-bold mb-6 text-blue-200 text-center">
            Welcome to Meetzy
          </h1>
          <div className="space-y-4">
            <Button
              onClick={() => setView("login")}
              className="w-full font-bold text-base bg-blue-500 hover:bg-blue-600 text-white"
            >
              Login
            </Button>
            <Button
              onClick={() => setView("signup")}
              variant="outline"
              className="w-full font-bold text-base border-blue-400/30 text-blue-200 hover:bg-blue-400/10"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background font-playfair relative">
      <Logo />
      <div className="bg-glass mt-6 p-8 rounded-2xl w-full max-w-md shadow-glass border border-border">
        <h1 className="text-2xl font-bold mb-4 text-blue-200 text-center">
          {view === "login" ? "Login to Meetzy" : "Create your Meetzy Account"}
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {view === "signup" && (
            <Input
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={submitting}
              autoFocus
              className="bg-blue-950/20 border-blue-400/30 text-blue-100 placeholder:text-blue-300/60"
            />
          )}
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus={view === "login"}
            disabled={submitting}
            className="bg-blue-950/20 border-blue-400/30 text-blue-100 placeholder:text-blue-300/60"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={submitting}
            className="bg-blue-950/20 border-blue-400/30 text-blue-100 placeholder:text-blue-300/60"
          />
          <Button
            type="submit"
            className="w-full font-bold text-base bg-blue-500 hover:bg-blue-600 text-white"
            disabled={submitting}
          >
            {view === "login" ? "Login" : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center text-blue-200">
          {view === "login" ? (
            <>
              Don't have an account?{" "}
              <button 
                className="underline text-blue-300 hover:text-blue-200 font-medium" 
                onClick={() => setView("signup")} 
                disabled={submitting}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button 
                className="underline text-blue-300 hover:text-blue-200 font-medium" 
                onClick={() => setView("login")} 
                disabled={submitting}
              >
                Login
              </button>
            </>
          )}
        </div>
        <div className="mt-4 text-center">
          <button 
            className="text-blue-300/70 hover:text-blue-200 text-sm" 
            onClick={() => setView("landing")}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
