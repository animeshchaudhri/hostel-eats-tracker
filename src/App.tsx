import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { LandingPage } from "./pages/LandingPage";
import { AdminSubscriptionManager } from "./components/AdminSubscriptionManager";
import { SystemTest } from "./components/SystemTest";

function App() {
  const { user, loading } = useAuth();

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

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/test" element={<SystemTest />} />
      <Route 
        path="/" 
        element={user ? <Index /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/subscriptions" 
        element={user?.isAdmin ? <AdminSubscriptionManager /> : <Navigate to="/" replace />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;