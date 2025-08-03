import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Plus, Minus, AlertCircle, CheckCircle, Crown } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface User {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
  isActive?: boolean;
}

interface ExtraItem {
  _id: string;
  id?: string;
  name: string;
  price: number;
  category: string;
  unit: string;
}

interface MealPlan {
  id: string;
  name: string;
  price: number;
  mealTypes: string[];
  totalMeals: number;
}

interface Subscription {
  id: string;
  remainingMeals: number;
  mealPlanId: MealPlan;
  status: string;
  startDate: string;
  endDate: string;
}

interface SmartMealEntryFormProps {
  users: User[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function SmartMealEntryForm({ users, onSave, onCancel }: SmartMealEntryFormProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [mealType, setMealType] = useState('');
  const [dishName, setDishName] = useState('');
  const [standalonePrice, setStandalonePrice] = useState(50); // Default meal price
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
  
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExtraItems();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      checkUserSubscription(selectedUserId);
    } else {
      setUserSubscription(null);
    }
  }, [selectedUserId]);

  const fetchExtraItems = async () => {
    try {
      const response = await apiClient.getExtraItems();
      setExtraItems(response.items || []);
    } catch (error) {
      console.error('Failed to fetch extra items:', error);
    }
  };

  const checkUserSubscription = async (userId: string) => {
    try {
      // Use the admin endpoint to check user's active subscription
      const response = await apiClient.get(`/subscriptions/user/${userId}/active`);
      
      if (response.subscription) {
        setUserSubscription(response.subscription);
      } else {
        setUserSubscription(null);
      }
    } catch (error) {
      console.error('Failed to check user subscription:', error);
      setUserSubscription(null);
    }
  };

  const canUseSubscription = () => {
    if (!userSubscription || !mealType) return false;
    
    return (
      userSubscription.status === 'active' &&
      userSubscription.remainingMeals > 0 &&
      userSubscription.mealPlanId.mealTypes.includes(mealType) &&
      new Date() >= new Date(userSubscription.startDate) &&
      new Date() <= new Date(userSubscription.endDate)
    );
  };

  const calculateCosts = () => {
    const isSubscriptionCovered = canUseSubscription();
    const mealCost = isSubscriptionCovered ? 0 : standalonePrice;
    
    const extrasCost = Object.entries(selectedExtras).reduce((sum, [itemId, quantity]) => {
      const item = extraItems.find(i => (i._id || i.id) === itemId);
      return sum + (item ? item.price * quantity : 0);
    }, 0);

    return {
      mealCost,
      extrasCost,
      totalCost: mealCost + extrasCost,
      isSubscriptionCovered
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !mealType || !dishName) {
      toast({ 
        title: "Missing Information", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    
    try {
      const costs = calculateCosts();
      
      const extraItemsArray = Object.entries(selectedExtras)
        .filter(([_, quantity]) => quantity > 0)
        .map(([itemId, quantity]) => {
          const item = extraItems.find(i => (i._id || i.id) === itemId);
          const price = (item && typeof item.price === 'number') ? item.price : 0;
          
          return {
            itemId: itemId,
            quantity: Number(quantity),
            price: Number(price),
            totalCost: Number(price * quantity)
          };
        });

      const mealData = {
        userId: selectedUserId,
        entryDate: new Date().toISOString().split('T')[0],
        mealType,
        dishName,
        cost: costs.isSubscriptionCovered ? 0 : standalonePrice,
        extraItems: extraItemsArray,
        notes: `Added via admin panel${costs.isSubscriptionCovered ? ' (subscription meal)' : ''}`
      };

      await onSave(mealData);
      
      // Reset form
      setSelectedUserId('');
      setMealType('');
      setDishName('');
      setSelectedExtras({});
      
      toast({ 
        title: "Success!", 
        description: `Meal entry added successfully. ${costs.isSubscriptionCovered ? 'Used subscription meal.' : `Charged ₹${costs.totalCost}`}`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Failed to save meal entry:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save meal entry", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const costs = calculateCosts();
  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">👤 Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a student..." />
            </SelectTrigger>
            <SelectContent>
              {users.filter(u => u.isActive !== false && !u.isAdmin).map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} - Room {user.roomNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedUser && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="font-medium">{selectedUser.name}</p>
              <p className="text-sm text-muted-foreground">Room {selectedUser.roomNumber}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Status */}
      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userSubscription ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active Subscription
                  </Badge>
                  <span className="text-sm">{userSubscription.mealPlanId.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Remaining Meals:</span>
                    <span className="ml-2 font-medium">{userSubscription.remainingMeals}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid Until:</span>
                    <span className="ml-2 font-medium">
                      {new Date(userSubscription.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Covers:</span>
                  <div className="flex gap-1 mt-1">
                    {userSubscription.mealPlanId.mealTypes.map(type => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">No active subscription - will charge per meal</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🍛 Meal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mealType">Meal Type *</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
                  <SelectItem value="lunch">🍛 Lunch</SelectItem>
                  <SelectItem value="dinner">🍽️ Dinner</SelectItem>
                </SelectContent>
              </Select>
              
              {mealType && userSubscription && (
                <div className="mt-2">
                  {userSubscription.mealPlanId.mealTypes.includes(mealType) ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      ✓ Covered by subscription
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Not covered - will charge ₹{standalonePrice}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="dishName">Dish Name *</Label>
              <Input
                id="dishName"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="Enter dish name"
                required
              />
            </div>
          </div>

          {!costs.isSubscriptionCovered && (
            <div>
              <Label htmlFor="standalonePrice">Meal Price (₹) *</Label>
              <Input
                id="standalonePrice"
                type="number"
                min="0"
                step="1"
                value={standalonePrice}
                onChange={(e) => setStandalonePrice(Number(e.target.value) || 0)}
                placeholder="Enter meal price"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extra Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🛒 Extra Items (Always Charged)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add extra items like extra rice, dal, etc. These are always charged separately.
          </p>
        </CardHeader>
        <CardContent>
          {extraItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No extra items available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extraItems.map((item) => (
                <div key={item._id || item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price}/{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedExtras(prev => ({
                        ...prev,
                        [item._id || item.id]: Math.max(0, (prev[item._id || item.id] || 0) - 1)
                      }))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{selectedExtras[item._id || item.id] || 0}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedExtras(prev => ({
                        ...prev,
                        [item._id || item.id]: (prev[item._id || item.id] || 0) + 1
                      }))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">💰 Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Base Meal:</span>
              <span>
                {costs.isSubscriptionCovered ? (
                  <Badge className="bg-green-100 text-green-800">FREE (Subscription)</Badge>
                ) : (
                  <span className="font-medium">₹{costs.mealCost}</span>
                )}
              </span>
            </div>
            
            {costs.extrasCost > 0 && (
              <div className="flex justify-between items-center">
                <span>Extra Items:</span>
                <span className="font-medium">₹{costs.extrasCost}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total to Charge:</span>
              <span className="text-green-600">₹{costs.totalCost}</span>
            </div>

            {costs.isSubscriptionCovered && (
              <p className="text-sm text-green-600 text-center">
                ✓ Meal covered by subscription! Only extras charged.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={loading || !selectedUserId || !mealType || !dishName}
        >
          {loading ? 'Adding...' : '✅ Add Meal Entry'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
