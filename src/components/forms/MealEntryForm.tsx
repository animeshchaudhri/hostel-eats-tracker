import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
  isActive?: boolean;
}

interface MealEntry {
  id?: string;
  _id?: string;
  userId: any;
  entryDate: string;
  mealType: string;
  dishName: string;
  cost: number;
}

interface MealEntryFormProps {
  entry: MealEntry | null;
  users: User[];
  onSave: (data: Partial<MealEntry>) => void;
  onCancel: () => void;
}

export function MealEntryForm({ entry, users, onSave, onCancel }: MealEntryFormProps) {
  const [formData, setFormData] = useState({
    userId: (typeof entry?.userId === 'string' ? entry.userId : entry?.userId?.id || entry?.userId?._id) || '',
    entryDate: entry?.entryDate ? entry.entryDate.split('T')[0] : new Date().toISOString().split('T')[0],
    mealType: entry?.mealType || '',
    dishName: entry?.dishName || '',
    cost: entry?.cost || 0,
  });

  // Reset form when entry changes
  useEffect(() => {
    setFormData({
      userId: (typeof entry?.userId === 'string' ? entry.userId : entry?.userId?.id || entry?.userId?._id) || '',
      entryDate: entry?.entryDate ? entry.entryDate.split('T')[0] : new Date().toISOString().split('T')[0],
      mealType: entry?.mealType || '',
      dishName: entry?.dishName || '',
      cost: entry?.cost || 0,
    });
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.userId) {
      toast({ title: "Error", description: "Please select a student", variant: "destructive" });
      return;
    }
    if (!formData.mealType) {
      toast({ title: "Error", description: "Please select meal type", variant: "destructive" });
      return;
    }
    if (!formData.dishName.trim()) {
      toast({ title: "Error", description: "Please enter dish name", variant: "destructive" });
      return;
    }
    if (formData.cost <= 0) {
      toast({ title: "Error", description: "Please enter a valid cost", variant: "destructive" });
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Student *</label>
          <Select 
            value={formData.userId} 
            onValueChange={(value) => {
              setFormData({ ...formData, userId: value });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {users.filter(u => !u.isAdmin).map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} (Room {user.roomNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Date *</label>
          <Input
            type="date"
            value={formData.entryDate}
            onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Meal Type *</label>
          <Select value={formData.mealType} onValueChange={(value) => setFormData({ ...formData, mealType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
              <SelectItem value="lunch">🍛 Lunch</SelectItem>
              <SelectItem value="dinner">🍽️ Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Dish Name *</label>
          <Input
            value={formData.dishName}
            onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
            placeholder="Enter dish name"
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Cost (₹) *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
            placeholder="Enter cost in rupees"
            required
          />
        </div>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {entry ? 'Update Entry' : 'Add Entry'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
