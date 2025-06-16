
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
  const [view, setView] = useState<"login" | "signup">("login");
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background font-playfair relative">
      <Logo />
      <div className="bg-glass mt-6 p-8 rounded-2xl w-full max-w-md shadow-glass">
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
            />
          )}
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus={view === "login"}
            disabled={submitting}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={submitting}
          />
          <Button
            type="submit"
            className="w-full font-bold text-base"
            disabled={submitting}
          >
            {view === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center text-blue-100">
          {view === "login" ? (
            <>
              Don't have an account?{" "}
              <button className="underline text-blue-200" onClick={() => setView("signup")} disabled={submitting}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="underline text-blue-200" onClick={() => setView("login")} disabled={submitting}>
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
