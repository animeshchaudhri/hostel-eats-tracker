import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';

interface CreateSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: any[];
  mealPlans: any[];
  onSave: (subscriptionData: any) => void;
}

export function CreateSubscriptionDialog({ 
  open, 
  onOpenChange, 
  users, 
  mealPlans, 
  onSave 
}: CreateSubscriptionDialogProps) {
  const [newSubscription, setNewSubscription] = useState({
    userId: '',
    mealPlanId: '',
    startDate: '',
    endDate: '',
    amountPaid: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subscriptionData = {
      ...newSubscription,
      amountPaid: parseFloat(newSubscription.amountPaid) || 0
    };

    onSave(subscriptionData);
    
    // Reset form
    setNewSubscription({
      userId: '',
      mealPlanId: '',
      startDate: '',
      endDate: '',
      amountPaid: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Subscription</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Student</Label>
            <Select value={newSubscription.userId} onValueChange={(value) => 
              setNewSubscription(prev => ({...prev, userId: value}))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {users.filter(u => !u.isAdmin).map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - Room {user.roomNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Meal Plan</Label>
            <Select value={newSubscription.mealPlanId} onValueChange={(value) => 
              setNewSubscription(prev => ({...prev, mealPlanId: value}))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select meal plan" />
              </SelectTrigger>
              <SelectContent>
                {mealPlans.filter(p => p.isActive).map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex flex-col items-start">
                      <span>{plan.name}</span>
                      <span className="text-xs text-muted-foreground">₹{plan.price} ({plan.totalMeals} meals)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newSubscription.startDate}
                onChange={(e) => setNewSubscription(prev => ({...prev, startDate: e.target.value}))}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newSubscription.endDate}
                onChange={(e) => setNewSubscription(prev => ({...prev, endDate: e.target.value}))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label>Amount Paid (₹)</Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={newSubscription.amountPaid}
              onChange={(e) => setNewSubscription(prev => ({...prev, amountPaid: e.target.value}))}
              placeholder="0"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="flex-1">Create Subscription</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
