import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../../../context/toast.context.jsx";
import { useState } from "react";
import { Input } from "../../../components/ui/Input.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { Sparkle } from "@phosphor-icons/react";
import { ThemeToggle } from "../../../components/ui/ThemeToggle.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || submitting) return;

    setSubmitting(true);
    try {
      await handleRegister({ username, email, password });
      showToast("Account created successfully! Welcome to Interview AI.", "success");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <span className="text-sm font-medium text-mute">Loading...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex bg-canvas-soft relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left side branding */}
      <div className="hidden lg:flex flex-col flex-1 bg-primary text-on-primary p-12 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-2 font-semibold text-xl tracking-tight mb-auto">
          <Sparkle weight="fill" className="text-cyan w-6 h-6" />
          <span>Interview AI</span>
        </div>
        
        <div className="relative z-10 max-w-lg mt-auto">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.04em] leading-[1.1] mb-6">
            Elevate your career trajectory.
          </h1>
          <p className="text-lg text-mute mb-8">
            Unlock personalized interview strategies, ATS audits, and AI mock sessions.
          </p>
        </div>

        {/* Mesh gradient mock background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          background: 'radial-gradient(circle at top right, var(--color-link), transparent 50%), radial-gradient(circle at bottom left, var(--color-success), transparent 50%)'
        }}></div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden flex items-center gap-2 font-semibold text-xl tracking-tight justify-center">
            <Sparkle weight="fill" className="text-primary w-6 h-6" />
            <span>Interview AI</span>
          </div>

          <Card padding="xl" elevation="3">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-ink mb-2">Create Account</h2>
              <p className="text-sm text-body">Join the AI-powered career workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <Input
                label="Full Name or Username"
                type="text"
                id="username"
                required
                placeholder="Alex Morgan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Input
                label="Email Address"
                type="email"
                id="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <Input
                label="Password"
                type="password"
                id="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" size="md" className="w-full mt-2" disabled={submitting}>
                {submitting ? "Creating Account..." : "Create Free Account"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-body">
              <span>Already have an account? </span>
              <Link to="/login" className="text-link font-medium hover:text-link-deep transition-colors">
                Sign in
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Register;
