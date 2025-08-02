import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChefHat, TrendingUp, PieChart, Target } from "lucide-react";

interface MealEntry {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  dish: string;
  cost: number;
}

interface DishSummaryProps {
  entries: MealEntry[];
}

export const DishSummary = ({ entries }: DishSummaryProps) => {
  // Calculate dish frequency
  const dishCounts = entries.reduce((acc, entry) => {
    acc[entry.dish] = (acc[entry.dish] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate category spending
  const mealSpending = entries.reduce((acc, entry) => {
    acc[entry.meal] = (acc[entry.meal] || 0) + entry.cost;
    return acc;
  }, {} as Record<string, number>);

  const totalSpend = entries.reduce((sum, entry) => sum + entry.cost, 0);

  // Sort dishes by frequency
  const sortedDishes = Object.entries(dishCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8); // Top 8 dishes

  const mealColors = {
    breakfast: "bg-breakfast-bg border-breakfast-border text-breakfast-border",
    lunch: "bg-lunch-bg border-lunch-border text-lunch-border", 
    dinner: "bg-dinner-bg border-dinner-border text-dinner-border"
  };

  const mealIcons = {
    breakfast: "🍳",
    lunch: "🍛", 
    dinner: "🍽️"
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <PieChart className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Dish Summary & Analytics</h2>
      </div>

      {/* Meal Category Spending */}
      <Card className="p-6 shadow-card border-0 bg-gradient-card">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Spending by Meal Category</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(mealSpending).map(([meal, amount]) => {
            const percentage = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
            return (
              <Card key={meal} className={`p-4 border ${mealColors[meal as keyof typeof mealColors]}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{mealIcons[meal as keyof typeof mealIcons]}</span>
                    <span className="font-medium capitalize">{meal}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {percentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Progress value={percentage} className="h-2" />
                  <div className="text-right">
                    <span className="text-lg font-bold">₹{amount}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Top Dishes */}
      <Card className="p-6 shadow-card border-0">
        <div className="flex items-center space-x-2 mb-4">
          <ChefHat className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Most Ordered Dishes</h3>
        </div>
        {sortedDishes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No dishes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedDishes.map(([dish, count], index) => {
              const dishEntries = entries.filter(e => e.dish === dish);
              const totalCost = dishEntries.reduce((sum, entry) => sum + entry.cost, 0);
              const avgCost = totalCost / count;
              
              return (
                <Card 
                  key={dish} 
                  className="p-4 hover:shadow-hover transition-all duration-300 border animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🍽️</span>
                        <h4 className="font-medium text-foreground">{dish}</h4>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Avg. ₹{avgCost.toFixed(0)} per serving
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className="font-bold">
                          {count}x
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold text-primary mt-1">
                        ₹{totalCost}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 shadow-card border-0 text-center">
          <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{Object.keys(dishCounts).length}</div>
          <div className="text-sm text-muted-foreground">Unique Dishes</div>
        </Card>
        <Card className="p-4 shadow-card border-0 text-center">
          <ChefHat className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {totalSpend > 0 ? (totalSpend / entries.length).toFixed(0) : 0}
          </div>
          <div className="text-sm text-muted-foreground">Avg. per Meal</div>
        </Card>
        <Card className="p-4 shadow-card border-0 text-center">
          <Target className="w-6 h-6 text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {sortedDishes[0] ? dishCounts[sortedDishes[0][0]] : 0}
          </div>
          <div className="text-sm text-muted-foreground">Most Ordered</div>
        </Card>
        <Card className="p-4 shadow-card border-0 text-center">
          <PieChart className="w-6 h-6 text-warning mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{entries.length}</div>
          <div className="text-sm text-muted-foreground">Total Meals</div>
        </Card>
      </div>
    </div>
  );
};