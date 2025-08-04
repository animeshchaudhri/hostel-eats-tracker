import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EditMealDialogProps {
  meal: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (mealData: any) => void;
}

export function EditMealDialog({ meal, open, onOpenChange, onSave }: EditMealDialogProps) {
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (meal) {
      const mealCopy = { ...meal };
      
      // Set the date
      if (meal.entryDate) {
        setSelectedDate(new Date(meal.entryDate));
      } else {
        setSelectedDate(new Date());
      }
      
      // Ensure totalCost is set properly
      if (!mealCopy.totalCost && mealCopy.cost) {
        mealCopy.totalCost = mealCopy.cost;
      }
      
      setEditingMeal(mealCopy);
    }
  }, [meal]);

  const handleSave = () => {
    if (editingMeal) {
      // Ensure all required fields are properly set with valid values
      const totalCostValue = parseFloat(editingMeal.totalCost) || parseFloat(editingMeal.cost) || 0;
      const costValue = parseFloat(editingMeal.cost) || totalCostValue || 0;
      
      const updatedMeal = {
        ...editingMeal,
        entryDate: selectedDate.toISOString().split('T')[0],
        totalCost: totalCostValue,
        cost: costValue,
        dishName: editingMeal.dishName?.trim() || 'Unknown Dish',
        mealType: editingMeal.mealType || 'breakfast'
      };
      
      console.log('Sending updated meal:', updatedMeal); // Debug log
      onSave(updatedMeal);
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
                value={editingMeal.mealType || 'breakfast'}
                onValueChange={(value) => setEditingMeal(prev => ({...prev, mealType: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
                  <SelectItem value="lunch">🍛 Lunch</SelectItem>
                  <SelectItem value="dinner">🍽️ Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Entry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Total Cost (₹)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={editingMeal.totalCost || editingMeal.cost || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setEditingMeal(prev => ({
                    ...prev, 
                    totalCost: value,
                    cost: value
                  }));
                }}
              />
            </div>
          </div>
          
          {/* Extra Items Display (if any) */}
          {editingMeal.extraItems && editingMeal.extraItems.length > 0 && (
            <div>
              <Label>Extra Items</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm space-y-1">
                  {editingMeal.extraItems.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item.itemName || item.name || 'Unknown Item'} x{item.quantity}</span>
                      <span>₹{item.totalCost || (item.price * item.quantity) || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Input
              value={editingMeal.notes || ''}
              onChange={(e) => setEditingMeal(prev => ({...prev, notes: e.target.value}))}
              placeholder="Add any notes about this meal entry..."
            />
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
