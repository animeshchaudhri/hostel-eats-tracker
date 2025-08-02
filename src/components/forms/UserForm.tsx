import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
  isActive?: boolean;
}

interface UserFormProps {
  user: User | null;
  onSave: (data: Partial<User>) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    roomNumber: user?.roomNumber || '',
    loginCode: user?.loginCode || '',
    isAdmin: user?.isAdmin || false,
    isActive: user?.isActive !== false,
  });

  // Reset form when user changes
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      roomNumber: user?.roomNumber || '',
      loginCode: user?.loginCode || '',
      isAdmin: user?.isAdmin || false,
      isActive: user?.isActive !== false,
    });
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Please enter name", variant: "destructive" });
      return;
    }
    if (!formData.roomNumber.trim()) {
      toast({ title: "Error", description: "Please enter room number", variant: "destructive" });
      return;
    }
    if (!formData.loginCode.trim()) {
      toast({ title: "Error", description: "Please enter login code", variant: "destructive" });
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Room Number *</label>
          <Input
            value={formData.roomNumber}
            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            placeholder="Enter room number"
            required
          />
        </div>
        
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Login Code *</label>
          <Input
            value={formData.loginCode}
            onChange={(e) => setFormData({ ...formData, loginCode: e.target.value })}
            placeholder="Enter unique login code"
            required
          />
        </div>
        
        <div className="sm:col-span-2 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAdmin"
              checked={formData.isAdmin}
              onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: !!checked })}
            />
            <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">
              Admin User
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active User
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {user ? 'Update User' : 'Add User'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
