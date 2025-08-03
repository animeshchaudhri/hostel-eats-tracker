import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';

interface CreateMealPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan?: any;
  onSave: (planData: any) => void;
}

export function CreateMealPlanDialog({ 
  open, 
  onOpenChange, 
  editingPlan, 
  onSave 
}: CreateMealPlanDialogProps) {
  const [newMealPlan, setNewMealPlan] = useState({
    name: '',
    price: '',
    description: '',
    mealTypes: [] as string[],
    totalMeals: '',
    features: '',
    isActive: true
  });

  useEffect(() => {
    if (editingPlan) {
      setNewMealPlan({
        name: editingPlan.name,
        price: editingPlan.price.toString(),
        description: editingPlan.description,
        mealTypes: editingPlan.mealTypes || [],
        totalMeals: editingPlan.totalMeals.toString(),
        features: editingPlan.features.join(', '),
        isActive: editingPlan.isActive
      });
    } else {
      setNewMealPlan({
        name: '',
        price: '',
        description: '',
        mealTypes: [],
        totalMeals: '',
        features: '',
        isActive: true
      });
    }
  }, [editingPlan, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mealPlanData = {
      name: newMealPlan.name,
      description: newMealPlan.description,
      type: 'mini_single',
      price: parseFloat(newMealPlan.price),
      mealsPerDay: 1,
      totalMeals: parseInt(newMealPlan.totalMeals),
      includes: [],
      features: newMealPlan.features.split(',').map(f => f.trim()).filter(Boolean),
      mealTypes: newMealPlan.mealTypes,
      isActive: newMealPlan.isActive
    };

    onSave(mealPlanData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? 'Edit Meal Plan' : 'Create New Meal Plan'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Plan Name</Label>
            <Input
              value={newMealPlan.name}
              onChange={(e) => setNewMealPlan(prev => ({...prev, name: e.target.value}))}
              placeholder="e.g., Mini Single, Full Double"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Price (₹)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={newMealPlan.price}
                onChange={(e) => setNewMealPlan(prev => ({...prev, price: e.target.value}))}
                placeholder="2300"
                required
              />
            </div>
            <div>
              <Label>Total Meals</Label>
              <Input
                type="number"
                min="1"
                value={newMealPlan.totalMeals}
                onChange={(e) => setNewMealPlan(prev => ({...prev, totalMeals: e.target.value}))}
                placeholder="30"
                required
              />
            </div>
          </div>
          
          <div>
            <Label>Description</Label>
            <Input
              value={newMealPlan.description}
              onChange={(e) => setNewMealPlan(prev => ({...prev, description: e.target.value}))}
              placeholder="Monthly meal plan description"
            />
          </div>
          
          <div>
            <Label>Meal Types (Select multiple)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['breakfast', 'lunch', 'dinner'].map(type => (
                <Button
                  key={type}
                  type="button"
                  variant={newMealPlan.mealTypes.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const types = newMealPlan.mealTypes.includes(type)
                      ? newMealPlan.mealTypes.filter(t => t !== type)
                      : [...newMealPlan.mealTypes, type];
                    setNewMealPlan(prev => ({...prev, mealTypes: types}));
                  }}
                  className="text-xs"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Features (comma separated)</Label>
            <Input
              value={newMealPlan.features}
              onChange={(e) => setNewMealPlan(prev => ({...prev, features: e.target.value}))}
              placeholder="Rice, Dal, Roti, Vegetable"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={newMealPlan.isActive}
              onChange={(e) => setNewMealPlan(prev => ({...prev, isActive: e.target.checked}))}
              className="rounded"
            />
            <Label htmlFor="isActive">Active Plan</Label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingPlan ? 'Update' : 'Create'} Plan
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
