import { useState } from "react";
import { UserDashboard } from "@/components/UserDashboard";
import { DailyLogTable } from "@/components/DailyLogTable";
import { DishSummary } from "@/components/DishSummary";
import { Navigation } from "@/components/Navigation";

// Sample data - in a real app, this would come from your backend/database
const sampleUser = {
  name: "Animesh",
  room: "C-806"
};

const sampleEntries = [
  {
    id: "1",
    date: "2025-01-31",
    meal: "breakfast" as const,
    dish: "Aalu Paratha",
    cost: 45
  },
  {
    id: "2", 
    date: "2025-01-31",
    meal: "lunch" as const,
    dish: "Dal Rice",
    cost: 80
  },
  {
    id: "3",
    date: "2025-01-31", 
    meal: "dinner" as const,
    dish: "Chicken Curry",
    cost: 120
  },
  {
    id: "4",
    date: "2025-01-30",
    meal: "breakfast" as const,
    dish: "Poha",
    cost: 35
  },
  {
    id: "5",
    date: "2025-01-30",
    meal: "lunch" as const,
    dish: "Rajma Rice",
    cost: 85
  },
  {
    id: "6",
    date: "2025-01-29",
    meal: "breakfast" as const,
    dish: "Bread Butter",
    cost: 25
  },
  {
    id: "7",
    date: "2025-01-29",
    meal: "lunch" as const,
    dish: "Chole Bhature",
    cost: 95
  },
  {
    id: "8",
    date: "2025-01-29",
    meal: "dinner" as const,
    dish: "Paneer Butter Masala",
    cost: 110
  },
  {
    id: "9",
    date: "2025-01-28",
    meal: "breakfast" as const,
    dish: "Aalu Paratha",
    cost: 45
  },
  {
    id: "10",
    date: "2025-01-28",
    meal: "lunch" as const,
    dish: "Biryani",
    cost: 150
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <UserDashboard user={sampleUser} entries={sampleEntries} />;
      case "daily-log":
        return <DailyLogTable entries={sampleEntries} />;
      case "summary":
        return <DishSummary entries={sampleEntries} />;
      default:
        return <UserDashboard user={sampleUser} entries={sampleEntries} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pt-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
