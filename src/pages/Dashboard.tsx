import { useState, useEffect } from "react";
import { DailyLogTable } from "@/components/DailyLogTable";
import { DishSummary } from "@/components/DishSummary";
import { Navigation } from "@/components/Navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SimpleUserDashboard } from "@/components/SimpleUserDashboard";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";

interface MealEntry {
  id: string;
  date: string;
  meal: "breakfast" | "lunch" | "dinner";
  dish: string;
  cost: number;
}

const Dashboard = () => {
  const { hostelUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hostelUser?.isAdmin) {
      setLoading(false);
      return;
    }
    fetchUserMealEntries();
  }, [hostelUser]);

  const fetchUserMealEntries = async () => {
    if (!hostelUser) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getUserMealEntries(hostelUser.id);
      
      if (response.entries) {
        // Transform data to match the expected format
        const transformedEntries: MealEntry[] = response.entries.map((entry: any) => ({
          id: entry._id,
          date: entry.entryDate.split('T')[0], // Convert to YYYY-MM-DD format
          meal: entry.mealType as "breakfast" | "lunch" | "dinner",
          dish: entry.dishName,
          cost: entry.cost, // Cost is already in rupees from our backend
        }));

        setMealEntries(transformedEntries);
      }
    } catch (error) {
      console.error('Error fetching meal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <div className="text-lg text-muted-foreground">Loading your data...</div>
        </div>
      </div>
    );
  }

  if (hostelUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold">🍽️ </h1>
            <Button variant="outline" onClick={signOut} size="sm">
              Sign Out
            </Button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <SimpleUserDashboard />;
      case "daily-log":
        return <DailyLogTable entries={mealEntries} />;
      case "summary":
        return <DishSummary entries={mealEntries} />;
      default:
        return <SimpleUserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Welcome, {hostelUser?.name}
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pt-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
