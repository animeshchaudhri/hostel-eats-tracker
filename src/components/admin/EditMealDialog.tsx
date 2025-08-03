import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from 'react';

interface EditMealDialogProps {
  meal: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (mealData: any) => void;
}

export function EditMealDialog({ meal, open, onOpenChange, onSave }: EditMealDialogProps) {
  const [editingMeal, setEditingMeal] = useState<any>(null);

  useEffect(() => {
    if (meal) {
      setEditingMeal({ ...meal });
    }
  }, [meal]);

  const handleSave = () => {
    if (editingMeal) {
      onSave(editingMeal);
    }
  };

  if (!editingMeal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Meal Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Dish Name</Label>
              <Input
                value={editingMeal.dishName || ''}
                onChange={(e) => setEditingMeal(prev => ({...prev, dishName: e.target.value}))}
              />
            </div>
            <div>
              <Label>Meal Type</Label>
              <Select
                value={editingMeal.mealType || ''}
                onValueChange={(value) => setEditingMeal(prev => ({...prev, mealType: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Total Cost (₹)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={editingMeal.totalCost || editingMeal.cost || 0}
                onChange={(e) => setEditingMeal(prev => ({
                  ...prev, 
                  totalCost: parseFloat(e.target.value) || 0,
                  cost: parseFloat(e.target.value) || 0
                }))}
              />
            </div>
            <div>
              <Label>Entry Date</Label>
              <Input
                type="date"
                value={editingMeal.entryDate ? editingMeal.entryDate.split('T')[0] : ''}
                onChange={(e) => setEditingMeal(prev => ({...prev, entryDate: e.target.value}))}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Update Meal Entry
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
