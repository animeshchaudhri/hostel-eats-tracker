import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { SmartMealEntryForm } from "../SmartMealEntryForm";
import { AdminStats } from './AdminStats';
import { MealHistoryTab } from './MealHistoryTab';
import { SubscriptionsTab } from './SubscriptionsTab';
import { MealPlansTab } from './MealPlansTab';
import { UsersTab } from './UsersTab';
import { 
  UtensilsCrossed, 
  Crown, 
  Package,
  Users
} from 'lucide-react';
import apiClient from '@/lib/apiClient';

export function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [mealEntries, setMealEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMealEntryForm, setShowMealEntryForm] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, mealPlansRes, subscriptionsRes, mealsRes] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getMealPlans(),
        apiClient.getAllSubscriptions(),
        apiClient.getMealEntries()
      ]);
      
      setUsers(usersRes.users || []);
      setMealPlans(mealPlansRes.plans || []);
      setSubscriptions(subscriptionsRes.subscriptions || []);
      setMealEntries(mealsRes.entries || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Meal Entry handlers
  const handleMealEntrySave = async (mealData: any) => {
    try {
      await apiClient.createMealEntry(mealData);
      setShowMealEntryForm(false);
      fetchAllData();
      toast({ 
        title: "Success!", 
        description: "Meal entry added successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to create meal entry:', error);
      toast({ 
        title: "Error", 
        description: "Failed to create meal entry", 
        variant: "destructive" 
      });
      throw error;
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal entry?')) return;

    try {
      await apiClient.deleteMealEntry(mealId);
      toast({ title: "Success!", description: "Meal entry deleted successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to delete meal entry:', error);
      toast({ title: "Error", description: "Failed to delete meal entry", variant: "destructive" });
    }
  };

  const handleUpdateMeal = async (mealId: string, updatedMeal: any) => {
    try {
      const updateData = {
        entryDate: updatedMeal.entryDate,
        mealType: updatedMeal.mealType,
        dishName: updatedMeal.dishName,
        cost: updatedMeal.totalCost || updatedMeal.cost || 0,
        notes: updatedMeal.notes || ''
      };
      
      await apiClient.updateMealEntry(mealId, updateData);
      toast({ title: "Success!", description: "Meal entry updated successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to update meal entry:', error);
      toast({ title: "Error", description: "Failed to update meal entry", variant: "destructive" });
    }
  };

  // Subscription handlers
  const handleCreateSubscription = async (subscriptionData: any) => {
    try {
      await apiClient.createSubscription(subscriptionData);
      toast({ title: "Success!", description: "Subscription created successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to create subscription:', error);
      toast({ title: "Error", description: "Failed to create subscription", variant: "destructive" });
    }
  };

  const handleUpdateSubscription = async (subscriptionId: string, updatedData: any) => {
    try {
      await apiClient.updateSubscription(subscriptionId, updatedData);
      toast({ title: "Success!", description: "Subscription updated successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to update subscription:', error);
      toast({ title: "Error", description: "Failed to update subscription", variant: "destructive" });
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      await apiClient.cancelSubscription(subscriptionId);
      toast({ title: "Success!", description: "Subscription cancelled successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast({ title: "Error", description: "Failed to cancel subscription", variant: "destructive" });
    }
  };

  // Meal Plan handlers
  const handleCreateMealPlan = async (planData: any) => {
    try {
      await apiClient.createMealPlan(planData);
      toast({ title: "Success!", description: "Meal plan created successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to create meal plan:', error);
      toast({ title: "Error", description: "Failed to create meal plan", variant: "destructive" });
    }
  };

  const handleUpdateMealPlan = async (planId: string, planData: any) => {
    try {
      await apiClient.updateMealPlan(planId, planData);
      toast({ title: "Success!", description: "Meal plan updated successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to update meal plan:', error);
      toast({ title: "Error", description: "Failed to update meal plan", variant: "destructive" });
    }
  };

  const handleDeleteMealPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this meal plan?')) return;

    try {
      await apiClient.deleteMealPlan(planId);
      toast({ title: "Success!", description: "Meal plan deleted successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to delete meal plan:', error);
      toast({ title: "Error", description: "Failed to delete meal plan", variant: "destructive" });
    }
  };

  // User handlers
  const handleCreateUser = async (userData: any) => {
    try {
      await apiClient.createUser(userData);
      toast({ title: "Success!", description: "User created successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      await apiClient.updateUser(userId, userData);
      toast({ title: "Success!", description: "User updated successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiClient.deleteUser(userId);
      toast({ title: "Success!", description: "User deleted successfully" });
      fetchAllData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  // Calculate statistics
  const stats = {
    totalStudents: users.filter(u => !u.isAdmin).length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    totalRevenue: subscriptions.reduce((sum, s) => sum + (s.amountPaid || 0), 0),
    pendingPayments: subscriptions.reduce((sum, s) => sum + Math.max(0, (s.totalAmount || 0) - (s.amountPaid || 0)), 0),
    totalMeals: mealEntries.length,
    subscriptionMeals: mealEntries.filter(m => m.entryType === 'subscription').length,
    paidMeals: mealEntries.filter(m => m.entryType === 'standalone').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <div className="text-lg text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start sm:gap-4">
        <div className='flex'>
        <div className='flex flex-col '>
          <h1 className="text-2xl sm:text-3xl font-bold">🍽️  Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage meals, plans, and subscriptions</p>
           </div>
           <div className="flex gap-2">
          <Dialog open={showMealEntryForm} onOpenChange={setShowMealEntryForm}>
            <DialogTrigger asChild>
              <Button className="gap-2 text-sm">
                <UtensilsCrossed className="h-4 w-4" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Meal Entry</DialogTitle>
              </DialogHeader>
              <SmartMealEntryForm
                users={users}
                onSave={handleMealEntrySave}
                onCancel={() => setShowMealEntryForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        </div>
        
       
      </div>

      {/* Stats Cards */}
      <AdminStats stats={stats} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="meals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="meals" className="flex-col gap-1 sm:flex-row sm:gap-2 h-12 sm:h-10">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Meals</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex-col gap-1 sm:flex-row sm:gap-2 h-12 sm:h-10">
            <Crown className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="meal-plans" className="flex-col gap-1 sm:flex-row sm:gap-2 h-12 sm:h-10">
            <Package className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Plans</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-col gap-1 sm:flex-row sm:gap-2 h-12 sm:h-10">
            <Users className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Users</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="meals" className="mt-0">
            <MealHistoryTab
              mealEntries={mealEntries}
              stats={stats}
              onDeleteMeal={handleDeleteMeal}
              onUpdateMeal={handleUpdateMeal}
            />
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-0">
            <SubscriptionsTab
              subscriptions={subscriptions}
              users={users}
              mealPlans={mealPlans}
              onCreateSubscription={handleCreateSubscription}
              onUpdateSubscription={handleUpdateSubscription}
              onCancelSubscription={handleCancelSubscription}
            />
          </TabsContent>

          <TabsContent value="meal-plans" className="mt-0">
            <MealPlansTab
              mealPlans={mealPlans}
              onCreateMealPlan={handleCreateMealPlan}
              onUpdateMealPlan={handleUpdateMealPlan}
              onDeleteMealPlan={handleDeleteMealPlan}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <UsersTab
              users={users}
              subscriptions={subscriptions}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
