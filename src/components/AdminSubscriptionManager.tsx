import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import apiClient from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { Plus, Users, UtensilsCrossed, CreditCard, TrendingUp, Edit, Trash2 } from 'lucide-react';

interface MealPlan {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  mealsPerDay: number;
  totalMeals: number;
  includes: string[];
  features: string[];
  mealTypes: string[];
  isActive: boolean;
}

interface ExtraItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  isActive: boolean;
}

interface Subscription {
  id: string;
  userId: {
    id: string;
    name: string;
    roomNumber: string;
    loginCode: string;
  };
  mealPlanId: MealPlan;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  remainingMeals: number;
  totalMeals: number;
  notes?: string;
  autoRenew: boolean;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  pendingRevenue: number;
}

export function AdminSubscriptionManager() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showMealPlanDialog, setShowMealPlanDialog] = useState(false);
  const [showExtraItemDialog, setShowExtraItemDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  
  // Form states
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [selectedExtraItem, setSelectedExtraItem] = useState<ExtraItem | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMealPlans(),
        fetchExtraItems(),
        fetchSubscriptions(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMealPlans = async () => {
    try {
      const response = await apiClient.getMealPlans();
      setMealPlans(response.plans || []);
    } catch (error) {
      console.error('Fetch meal plans error:', error);
      toast({ title: "Error", description: "Failed to fetch meal plans", variant: "destructive" });
    }
  };

  const fetchExtraItems = async () => {
    try {
      const response = await apiClient.getExtraItems();
      setExtraItems(response.items || []);
    } catch (error) {
      console.error('Fetch extra items error:', error);
      toast({ title: "Error", description: "Failed to fetch extra items", variant: "destructive" });
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await apiClient.getAllSubscriptions();
      setSubscriptions(response.subscriptions || []);
    } catch (error) {
      console.error('Fetch subscriptions error:', error);
      toast({ title: "Error", description: "Failed to fetch subscriptions", variant: "destructive" });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.getSubscriptionStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const saveMealPlan = async (formData: FormData) => {
    try {
      const planData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        type: formData.get('type') as string,
        price: Number(formData.get('price')),
        mealsPerDay: Number(formData.get('mealsPerDay')),
        totalMeals: Number(formData.get('totalMeals')),
        includes: (formData.get('includes') as string).split(',').map(s => s.trim()),
        features: (formData.get('features') as string).split(',').map(s => s.trim()),
        mealTypes: formData.getAll('mealTypes') as string[]
      };

      if (selectedMealPlan?.id) {
        await apiClient.updateMealPlan(selectedMealPlan.id, planData);
        toast({ title: "Success", description: "Meal plan updated successfully" });
      } else {
        await apiClient.createMealPlan(planData);
        toast({ title: "Success", description: "Meal plan created successfully" });
      }

      setShowMealPlanDialog(false);
      setSelectedMealPlan(null);
      fetchMealPlans();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save meal plan", variant: "destructive" });
    }
  };

  const saveExtraItem = async (formData: FormData) => {
    try {
      const itemData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: Number(formData.get('price')),
        category: formData.get('category') as string,
        unit: formData.get('unit') as string
      };

      if (selectedExtraItem?.id) {
        await apiClient.updateExtraItem(selectedExtraItem.id, itemData);
        toast({ title: "Success", description: "Extra item updated successfully" });
      } else {
        await apiClient.createExtraItem(itemData);
        toast({ title: "Success", description: "Extra item created successfully" });
      }

      setShowExtraItemDialog(false);
      setSelectedExtraItem(null);
      fetchExtraItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save extra item", variant: "destructive" });
    }
  };

  const updateSubscriptionPayment = async (subscriptionId: string, amountPaid: number) => {
    try {
      await apiClient.updateSubscriptionPayment(subscriptionId, amountPaid);
      toast({ title: "Success", description: "Payment updated successfully" });
      fetchSubscriptions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update payment", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-lg text-gray-600">Loading subscription manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">🏠 Subscription Manager</h1>
          <Badge variant="secondary" className="text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2 self-start">
            👑 Administrator
          </Badge>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From all subscriptions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">₹{stats.pendingRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Outstanding payments</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subscriptions">📋 Subscriptions</TabsTrigger>
            <TabsTrigger value="meal-plans">🍽️ Meal Plans</TabsTrigger>
            <TabsTrigger value="extra-items">🛒 Extra Items</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📋 Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-gray-600">No subscriptions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <Card key={subscription.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {subscription.userId.name} (Room {subscription.userId.roomNumber})
                              </h3>
                              <p className="text-gray-600">{subscription.mealPlanId.name}</p>
                            </div>
                            <Badge className={getStatusColor(subscription.status)}>
                              {subscription.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Period</p>
                              <p className="font-medium">
                                {new Date(subscription.startDate).toLocaleDateString()} - 
                                {new Date(subscription.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="font-medium">₹{subscription.totalAmount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Amount Paid</p>
                              <p className="font-medium text-green-600">₹{subscription.amountPaid}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Balance</p>
                              <p className="font-medium text-red-600">
                                ₹{subscription.totalAmount - subscription.amountPaid}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>Meals Progress</span>
                              <span>
                                {subscription.totalMeals - subscription.remainingMeals} / {subscription.totalMeals}
                              </span>
                            </div>
                            <Progress 
                              value={((subscription.totalMeals - subscription.remainingMeals) / subscription.totalMeals) * 100} 
                              className="h-2" 
                            />
                          </div>

                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Update Payment
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Payment</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  const formData = new FormData(e.target as HTMLFormElement);
                                  const amount = Number(formData.get('amount'));
                                  updateSubscriptionPayment(subscription.id, amount);
                                }}>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="amount">Amount Paid</Label>
                                      <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        defaultValue={subscription.amountPaid}
                                        max={subscription.totalAmount}
                                        required
                                      />
                                    </div>
                                    <Button type="submit" className="w-full">
                                      Update Payment
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meal-plans" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>🍽️ Meal Plans Management</CardTitle>
                <Dialog open={showMealPlanDialog} onOpenChange={setShowMealPlanDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedMealPlan(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Meal Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedMealPlan ? 'Edit Meal Plan' : 'Add New Meal Plan'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      saveMealPlan(new FormData(e.target as HTMLFormElement));
                    }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={selectedMealPlan?.name}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select name="type" defaultValue={selectedMealPlan?.type}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mini_single">Mini Single</SelectItem>
                              <SelectItem value="mini_double">Mini Double</SelectItem>
                              <SelectItem value="full_double">Full Double</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            defaultValue={selectedMealPlan?.price}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="mealsPerDay">Meals Per Day</Label>
                          <Input
                            id="mealsPerDay"
                            name="mealsPerDay"
                            type="number"
                            defaultValue={selectedMealPlan?.mealsPerDay}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="totalMeals">Total Meals</Label>
                          <Input
                            id="totalMeals"
                            name="totalMeals"
                            type="number"
                            defaultValue={selectedMealPlan?.totalMeals}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={selectedMealPlan?.description}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="includes">Includes (comma separated)</Label>
                          <Input
                            id="includes"
                            name="includes"
                            defaultValue={selectedMealPlan?.includes.join(', ')}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="features">Features (comma separated)</Label>
                          <Input
                            id="features"
                            name="features"
                            defaultValue={selectedMealPlan?.features.join(', ')}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button type="submit" className="flex-1">
                          {selectedMealPlan ? 'Update' : 'Create'} Meal Plan
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowMealPlanDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mealPlans.map((plan) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </div>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold text-green-600">₹{plan.price}</p>
                          <p className="text-sm">{plan.totalMeals} meals • {plan.mealsPerDay}/day</p>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMealPlan(plan);
                                setShowMealPlanDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extra-items" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>🛒 Extra Items Management</CardTitle>
                <Dialog open={showExtraItemDialog} onOpenChange={setShowExtraItemDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedExtraItem(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Extra Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {selectedExtraItem ? 'Edit Extra Item' : 'Add New Extra Item'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      saveExtraItem(new FormData(e.target as HTMLFormElement));
                    }}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={selectedExtraItem?.name}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={selectedExtraItem?.price}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select name="category" defaultValue={selectedExtraItem?.category}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rice">Rice</SelectItem>
                              <SelectItem value="dal">Dal</SelectItem>
                              <SelectItem value="roti">Roti</SelectItem>
                              <SelectItem value="dal_rice">Dal Rice</SelectItem>
                              <SelectItem value="special">Special</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="unit">Unit</Label>
                          <Input
                            id="unit"
                            name="unit"
                            defaultValue={selectedExtraItem?.unit || 'piece'}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={selectedExtraItem?.description}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button type="submit" className="flex-1">
                          {selectedExtraItem ? 'Update' : 'Create'} Extra Item
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowExtraItemDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extraItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-green-600">₹{item.price}/{item.unit}</p>
                          <p className="text-sm capitalize text-gray-600">{item.category}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedExtraItem(item);
                                setShowExtraItemDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>📊 Subscription Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Subscriptions:</span>
                        <span className="font-bold">{stats.totalSubscriptions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active:</span>
                        <span className="font-bold text-green-600">{stats.activeSubscriptions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span className="font-bold text-yellow-600">{stats.pendingSubscriptions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expired:</span>
                        <span className="font-bold text-red-600">{stats.expiredSubscriptions}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>💰 Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Revenue:</span>
                        <span className="font-bold text-orange-600">₹{stats.pendingRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collection Rate:</span>
                        <span className="font-bold">
                          {stats.totalRevenue + stats.pendingRevenue > 0 
                            ? Math.round((stats.totalRevenue / (stats.totalRevenue + stats.pendingRevenue)) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
