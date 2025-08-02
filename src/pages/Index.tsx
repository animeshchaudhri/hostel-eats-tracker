import { useState, useEffect } from "react";
import { UserDashboard } from "@/components/UserDashboard";
import { DailyLogTable } from "@/components/DailyLogTable";
import { DishSummary } from "@/components/DishSummary";
import { Navigation } from "@/components/Navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface MealEntry {
  id: string;
  date: string;
  meal: "breakfast" | "lunch" | "dinner";
  dish: string;
  cost: number;
}

const Index = () => {
  const { hostelUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hostelUser?.is_admin) {
      setLoading(false);
      return;
    }
    fetchUserMealEntries();
  }, [hostelUser]);

  const fetchUserMealEntries = async () => {
    if (!hostelUser) return;

    try {
      const { data, error } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('user_id', hostelUser.id)
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error fetching meal entries:', error);
        return;
      }

      // Transform data to match the expected format
      const transformedEntries: MealEntry[] = (data || []).map(entry => ({
        id: entry.id,
        date: entry.entry_date,
        meal: entry.meal_type as "breakfast" | "lunch" | "dinner",
        dish: entry.dish_name,
        cost: entry.cost / 100, // Convert from paise to rupees
      }));

      setMealEntries(transformedEntries);
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

  if (hostelUser?.is_admin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold">🍽️ Mess Tracker</h1>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  const sampleUser = {
    name: hostelUser?.name || "Student",
    room: hostelUser?.room_number || "Unknown"
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <UserDashboard user={sampleUser} entries={mealEntries} />;
      case "daily-log":
        return <DailyLogTable entries={mealEntries} />;
      case "summary":
        return <DishSummary entries={mealEntries} />;
      default:
        return <UserDashboard user={sampleUser} entries={mealEntries} />;
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

export default Index;
