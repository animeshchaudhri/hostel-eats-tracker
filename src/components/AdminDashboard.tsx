import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, UtensilsCrossed } from 'lucide-react';

interface User {
  id: string;
  name: string;
  room_number: string;
  login_code: string;
  is_admin: boolean;
}

interface MealEntry {
  id: string;
  user_id: string;
  entry_date: string;
  meal_type: string;
  dish_name: string;
  cost: number;
  users: { name: string; room_number: string };
}

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MealEntry | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showEntryDialog, setShowEntryDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchMealEntries()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
      return;
    }
    setUsers(data || []);
  };

  const fetchMealEntries = async () => {
    const { data, error } = await supabase
      .from('meal_entries')
      .select(`
        *,
        users (name, room_number)
      `)
      .order('entry_date', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch meal entries", variant: "destructive" });
      return;
    }
    setMealEntries(data || []);
  };

  const saveUser = async (userData: Partial<User>) => {
    if (selectedUser?.id) {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', selectedUser.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase
        .from('users')
        .insert(userData as any);

      if (error) {
        toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
        return;
      }
    }

    toast({ title: "Success", description: `User ${selectedUser?.id ? 'updated' : 'created'} successfully` });
    setShowUserDialog(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "User deleted successfully" });
    fetchUsers();
  };

  const saveMealEntry = async (entryData: Partial<MealEntry>) => {
    // Convert cost from rupees to paise
    const costInPaise = Math.round((entryData.cost || 0) * 100);
    const dataToSave = { ...entryData, cost: costInPaise };

    if (selectedEntry?.id) {
      const { error } = await supabase
        .from('meal_entries')
        .update(dataToSave)
        .eq('id', selectedEntry.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update meal entry", variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase
        .from('meal_entries')
        .insert(dataToSave as any);

      if (error) {
        toast({ title: "Error", description: "Failed to create meal entry", variant: "destructive" });
        return;
      }
    }

    toast({ title: "Success", description: `Meal entry ${selectedEntry?.id ? 'updated' : 'created'} successfully` });
    setShowEntryDialog(false);
    setSelectedEntry(null);
    fetchMealEntries();
  };

  const deleteMealEntry = async (id: string) => {
    const { error } = await supabase
      .from('meal_entries')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete meal entry", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Meal entry deleted successfully" });
    fetchMealEntries();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          👑 Administrator
        </Badge>
      </div>

      <Tabs defaultValue="meal-entries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meal-entries" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Meal Entries
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meal-entries" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Meal Entries Management</CardTitle>
              <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedEntry(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedEntry ? 'Edit Meal Entry' : 'Add New Meal Entry'}
                    </DialogTitle>
                  </DialogHeader>
                  <MealEntryForm
                    entry={selectedEntry}
                    users={users}
                    onSave={saveMealEntry}
                    onCancel={() => setShowEntryDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Meal</TableHead>
                    <TableHead>Dish</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mealEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                      <TableCell>{entry.users.name}</TableCell>
                      <TableCell>{entry.users.room_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.meal_type === 'breakfast' && '🍳'}
                          {entry.meal_type === 'lunch' && '🍛'}
                          {entry.meal_type === 'dinner' && '🍽️'}
                          {entry.meal_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.dish_name}</TableCell>
                      <TableCell>₹{(entry.cost / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEntry({
                                ...entry,
                                cost: entry.cost / 100 // Convert back to rupees for editing
                              });
                              setShowEntryDialog(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMealEntry(entry.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Users Management</CardTitle>
              <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedUser(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedUser ? 'Edit User' : 'Add New User'}
                    </DialogTitle>
                  </DialogHeader>
                  <UserForm
                    user={selectedUser}
                    onSave={saveUser}
                    onCancel={() => setShowUserDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Login Code</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.room_number}</TableCell>
                      <TableCell>
                        <code className="font-mono bg-muted px-2 py-1 rounded">
                          {user.login_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_admin ? "default" : "secondary"}>
                          {user.is_admin ? '👑 Admin' : '👤 Student'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDialog(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(user.id)}
                            disabled={user.is_admin}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// User Form Component
function UserForm({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user: User | null; 
  onSave: (data: Partial<User>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    room_number: user?.room_number || '',
    login_code: user?.login_code || '',
    is_admin: user?.is_admin || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Room Number</label>
        <Input
          value={formData.room_number}
          onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Login Code</label>
        <Input
          value={formData.login_code}
          onChange={(e) => setFormData({ ...formData, login_code: e.target.value.toUpperCase() })}
          className="font-mono"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_admin"
          checked={formData.is_admin}
          onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
        />
        <label htmlFor="is_admin" className="text-sm font-medium">
          Administrator
        </label>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Meal Entry Form Component
function MealEntryForm({
  entry,
  users,
  onSave,
  onCancel,
}: {
  entry: MealEntry | null;
  users: User[];
  onSave: (data: Partial<MealEntry>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    user_id: entry?.user_id || '',
    entry_date: entry?.entry_date || new Date().toISOString().split('T')[0],
    meal_type: entry?.meal_type || '',
    dish_name: entry?.dish_name || '',
    cost: entry?.cost || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Student</label>
        <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {users.filter(u => !u.is_admin).map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} ({user.room_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Date</label>
        <Input
          type="date"
          value={formData.entry_date}
          onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Meal Type</label>
        <Select value={formData.meal_type} onValueChange={(value) => setFormData({ ...formData, meal_type: value })}>
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
        <label className="text-sm font-medium">Dish Name</label>
        <Input
          value={formData.dish_name}
          onChange={(e) => setFormData({ ...formData, dish_name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Cost (₹)</label>
        <Input
          type="number"
          step="0.01"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
          required
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}