import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Calendar, 
  DollarSign, 
  UtensilsCrossed,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface Subscription {
  id: string;
  mealPlanId: {
    name: string;
    price: number;
    mealTypes: string[];
    totalMeals: number;
  };
  startDate: string;
  endDate: string;
  totalAmount: number;
  amountPaid: number;
  remainingMeals: number;
  totalMeals: number;
  status: string;
}

interface MealEntry {
  id: string;
  entryDate: string;
  mealType: string;
  dishName: string;
  cost: number;
  totalCost: number;
  entryType: string;
  extraItems?: Array<{
    itemName: string;
    quantity: number;
    totalCost: number;
  }>;
}

export function SimpleUserDashboard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [recentMeals, setRecentMeals] = useState<MealEntry[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalSpent: 0,
    subscriptionCost: 0,
    extraItemsCost: 0,
    mealsConsumed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [subscriptionsRes, mealsRes] = await Promise.all([
        apiClient.getMySubscriptions(),
        apiClient.getMealEntries()
      ]);

      // Get active subscription
      const activeSubscription = subscriptionsRes.subscriptions?.find(
        (s: Subscription) => s.status === 'active'
      );
      setSubscription(activeSubscription || null);

      // Get recent meals (last 10)
      const meals = mealsRes.entries?.slice(0, 10) || [];
      setRecentMeals(meals);

      // Calculate monthly stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthMeals = mealsRes.entries?.filter((meal: MealEntry) => {
        const mealDate = new Date(meal.entryDate);
        return mealDate.getMonth() === currentMonth && mealDate.getFullYear() === currentYear;
      }) || [];

      const totalSpent = thisMonthMeals.reduce((sum: number, meal: MealEntry) => sum + (meal.totalCost || meal.cost || 0), 0);
      const subscriptionCost = activeSubscription ? (activeSubscription.amountPaid || 0) : 0;
      const extraItemsCost = thisMonthMeals.reduce((sum: number, meal: MealEntry) => {
        return sum + (meal.extraItems?.reduce((extraSum, item) => extraSum + (item.totalCost || 0), 0) || 0);
      }, 0);

      setMonthlyStats({
        totalSpent: totalSpent || 0,
        subscriptionCost: subscriptionCost || 0,
        extraItemsCost: extraItemsCost || 0,
        mealsConsumed: thisMonthMeals.length || 0
      });

    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <div className="text-lg text-muted-foreground">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const subscriptionProgress = subscription ? 
    (((subscription.totalMeals || 0) - (subscription.remainingMeals || 0)) / (subscription.totalMeals || 1)) * 100 : 0;

  const daysLeft = subscription ? 
    Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">🍽️ Your Meal Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track your meals and subscription</p>
      </div>

      {/* Subscription Status */}
      {subscription ? (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800 text-base sm:text-lg">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
              Active Subscription: {subscription.mealPlanId.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{subscription.remainingMeals || 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Meals Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{daysLeft}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Days Left</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-purple-600">₹{subscription.totalAmount || 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Plan Value</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Subscription Progress</span>
                <span>{Math.round(subscriptionProgress || 0)}% Used</span>
              </div>
              <Progress value={subscriptionProgress || 0} className="h-2" />
            </div>

            <div className="flex flex-wrap gap-2">
              {(subscription.mealPlanId.mealTypes || []).map(type => (
                <Badge key={type} className="bg-green-100 text-green-800 text-xs">
                  {type}
                </Badge>
              ))}
            </div>

            <div className="text-xs sm:text-sm text-muted-foreground">
              Valid: {new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.endDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardContent className="text-center py-6 sm:py-8">
            <Crown className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-orange-600 mb-3 sm:mb-4" />
            <h3 className="font-medium mb-2 text-sm sm:text-base">No Active Subscription</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">You're paying per meal. Consider getting a subscription to save money!</p>
            <Button className="gap-2 text-sm w-full sm:w-auto">
              <Crown className="h-4 w-4" />
              Contact Admin for Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Monthly Spending Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Spent (This Month)</p>
                <p className="text-lg sm:text-2xl font-bold">₹{monthlyStats.totalSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Subscription Cost</p>
                <p className="text-lg sm:text-2xl font-bold">₹{subscription.totalAmount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Extra Items Cost</p>
                <p className="text-lg sm:text-2xl font-bold">₹{monthlyStats.extraItemsCost}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Meals This Month</p>
                <p className="text-lg sm:text-2xl font-bold">{monthlyStats.mealsConsumed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Meals */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            Recent Meals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentMeals.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <UtensilsCrossed className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="font-medium mb-2 text-sm sm:text-base">No Meals Yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Your meal entries will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMeals.map(meal => (
                <div key={meal.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded-lg gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-sm sm:text-base">{meal.dishName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {meal.mealType}
                      </Badge>
                      {meal.entryType === 'subscription' && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          FREE
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(meal.entryDate).toLocaleDateString()}
                    </p>
                    
                    {meal.extraItems && meal.extraItems.length > 0 && (
                      <div className="text-xs text-muted-foreground break-words">
                        Extras: {meal.extraItems.map(item => `${item.itemName} x${item.quantity}`).join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-sm sm:text-base">₹{meal.totalCost || meal.cost || 0}</p>
                    {meal.entryType === 'subscription' && (meal.totalCost || meal.cost || 0) > 0 && (
                      <p className="text-xs text-muted-foreground">Extras only</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Need Help?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start gap-2 text-sm">
              <Crown className="h-4 w-4" />
              Upgrade Subscription
            </Button>
            <Button variant="outline" className="justify-start gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              View Full History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
