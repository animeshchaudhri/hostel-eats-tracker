import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from 'react';

interface EditSubscriptionDialogProps {
  subscription: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (subscriptionData: any) => void;
}

export function EditSubscriptionDialog({ 
  subscription, 
  open, 
  onOpenChange, 
  onSave 
}: EditSubscriptionDialogProps) {
  const [editingSubscription, setEditingSubscription] = useState<any>(null);

  useEffect(() => {
    if (subscription) {
      setEditingSubscription({ ...subscription });
    }
  }, [subscription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubscription) {
      // Extract only the necessary fields and ensure userId is a string
      const subscriptionData = {
        userId: editingSubscription.userId?.id || editingSubscription.userId?._id || editingSubscription.userId,
        mealPlanId: editingSubscription.mealPlanId?.id || editingSubscription.mealPlanId?._id || editingSubscription.mealPlanId,
        startDate: editingSubscription.startDate,
        endDate: editingSubscription.endDate,
        status: editingSubscription.status,
        remainingMeals: editingSubscription.remainingMeals,
        totalAmount: editingSubscription.totalAmount
      };
      onSave(subscriptionData);
    }
  };

  if (!editingSubscription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={editingSubscription.startDate ? editingSubscription.startDate.split('T')[0] : ''}
                onChange={(e) => setEditingSubscription(prev => ({...prev, startDate: e.target.value}))}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={editingSubscription.endDate ? editingSubscription.endDate.split('T')[0] : ''}
                onChange={(e) => setEditingSubscription(prev => ({...prev, endDate: e.target.value}))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Amount Paid (₹)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={editingSubscription.amountPaid || 0}
                onChange={(e) => setEditingSubscription(prev => ({
                  ...prev, 
                  amountPaid: parseFloat(e.target.value) || 0
                }))}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editingSubscription.status}
                onValueChange={(value) => setEditingSubscription(prev => ({...prev, status: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Remaining Meals</Label>
            <Input
              type="number"
              min="0"
              value={editingSubscription.remainingMeals || 0}
              onChange={(e) => setEditingSubscription(prev => ({
                ...prev, 
                remainingMeals: parseInt(e.target.value) || 0
              }))}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Update Subscription
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
