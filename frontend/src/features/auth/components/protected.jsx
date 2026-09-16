import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "../../../components/ui/Navbar.jsx";

const Protected = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <span className="text-sm font-medium text-mute">Loading...</span>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col">
      <Navbar />
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
        {children}
      </div>
    </div>
  );
};

export default Protected;
