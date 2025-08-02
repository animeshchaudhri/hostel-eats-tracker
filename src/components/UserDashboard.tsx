import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Calendar, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface MealEntry {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  dish: string;
  cost: number;
}

interface UserDashboardProps {
  user: {
    name: string;
    room: string;
  };
  entries: MealEntry[];
}

const mealIcons = {
  breakfast: "🍳",
  lunch: "🍛", 
  dinner: "🍽️"
};

const mealColors = {
  breakfast: "bg-breakfast-bg border-breakfast-border",
  lunch: "bg-lunch-bg border-lunch-border", 
  dinner: "bg-dinner-bg border-dinner-border"
};

export const UserDashboard = ({ user, entries }: UserDashboardProps) => {
  const [filterMeal, setFilterMeal] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("week");

  const totalSpend = entries.reduce((sum, entry) => sum + entry.cost, 0);
  
  const filteredEntries = entries.filter(entry => 
    filterMeal === "all" || entry.meal === filterMeal
  );

  // Calculate time range totals
  const now = new Date();
  const getFilteredByTime = () => {
    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const diffTime = now.getTime() - entryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (timeRange === "week") return diffDays <= 7;
      if (timeRange === "month") return diffDays <= 30;
      return true;
    });
    return filtered.reduce((sum, entry) => sum + entry.cost, 0);
  };

  const timeRangeTotal = getFilteredByTime();
  const isPositiveTrend = Math.random() > 0.5; // Placeholder for trend calculation

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* User Profile Card */}
      <Card className="p-6 bg-gradient-card shadow-card border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Room {user.room}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ₹{totalSpend}
            </div>
            <p className="text-sm text-muted-foreground">Total Spend</p>
          </div>
        </div>

        {/* Time Range Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground capitalize">{timeRange} Total</p>
                <p className="text-xl font-semibold">₹{timeRangeTotal}</p>
              </div>
              {isPositiveTrend ? (
                <TrendingUp className="w-5 h-5 text-spend-positive" />
              ) : (
                <TrendingDown className="w-5 h-5 text-spend-negative" />
              )}
            </div>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Meals</p>
              <p className="text-xl font-semibold">{entries.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 shadow-card border-0">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={filterMeal} onValueChange={setFilterMeal}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meals</SelectItem>
                <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
                <SelectItem value="lunch">🍛 Lunch</SelectItem>
                <SelectItem value="dinner">🍽️ Dinner</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Meal Entries */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Daily Food Entries
        </h2>
        {filteredEntries.length === 0 ? (
          <Card className="p-8 text-center shadow-card border-0">
            <p className="text-muted-foreground">No entries found for the selected filters.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <Card 
                key={entry.id} 
                className={`p-4 shadow-card border hover:shadow-hover transition-all duration-300 animate-fade-in ${mealColors[entry.meal]}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{mealIcons[entry.meal]}</span>
                    <div>
                      <h3 className="font-medium text-foreground">{entry.dish}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">₹{entry.cost}</div>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {entry.meal}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};