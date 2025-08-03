import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser?: any;
  onSave: (userData: any) => void;
}

export function CreateUserDialog({ 
  open, 
  onOpenChange, 
  editingUser, 
  onSave 
}: CreateUserDialogProps) {
  const [newUser, setNewUser] = useState({
    name: '',
    roomNumber: '',
    loginCode: '',
    isAdmin: false
  });

  useEffect(() => {
    if (editingUser) {
      setNewUser({
        name: editingUser.name,
        roomNumber: editingUser.roomNumber,
        loginCode: editingUser.loginCode,
        isAdmin: editingUser.isAdmin
      });
    } else {
      setNewUser({
        name: '',
        roomNumber: '',
        loginCode: '',
        isAdmin: false
      });
    }
  }, [editingUser, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newUser);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({...prev, name: e.target.value}))}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div>
            <Label>Room Number</Label>
            <Input
              value={newUser.roomNumber}
              onChange={(e) => setNewUser(prev => ({...prev, roomNumber: e.target.value}))}
              placeholder="e.g., 101, A-205"
              required
            />
          </div>
          
          <div>
            <Label>Login Code</Label>
            <Input
              value={newUser.loginCode}
              onChange={(e) => setNewUser(prev => ({...prev, loginCode: e.target.value}))}
              placeholder="4-digit login code"
              maxLength={4}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAdmin"
              checked={newUser.isAdmin}
              onChange={(e) => setNewUser(prev => ({...prev, isAdmin: e.target.checked}))}
            />
            <Label htmlFor="isAdmin">Make this user an admin</Label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingUser ? 'Update User' : 'Add User'}
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
