import { useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";

const Index = () => {
  const { hostelUser, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (hostelUser) {
    return <Dashboard />;
  }

  // If not authenticated, show landing page
  return <Landing />;
};

export default Index;
