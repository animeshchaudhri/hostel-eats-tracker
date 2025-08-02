import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import apiClient from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { Plus, Users, UtensilsCrossed } from 'lucide-react';

// Import the new component modules
import { MealEntryForm } from '@/components/forms/MealEntryForm';
import { UserForm } from '@/components/forms/UserForm';
import { FilterSection } from '@/components/sections/FilterSection';
import { StatsCards } from '@/components/sections/StatsCards';
import { MealEntriesTable } from '@/components/tables/MealEntriesTable';
import { UsersTable } from '@/components/tables/UsersTable';

// PDF generator utility
import { generateMealEntriesPDF } from '@/utils/PDFGenerator';

interface User {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
  isActive?: boolean; // Make this optional
}

interface MealEntry {
  id: string;
  _id?: string; // For backward compatibility 
  userId: any; // This will be the populated user object or just the ID
  entryDate: string;
  mealType: string;
  dishName: string;
  cost: number;
}

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MealEntry | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [mealEntries, searchTerm, selectedStudent, selectedMealType, dateFrom, dateTo]);

  const filterEntries = () => {
    let filtered = [...mealEntries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.dishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.userId?.name && entry.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.userId?.roomNumber && entry.userId.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Student filter
    if (selectedStudent && selectedStudent !== 'all') {
      filtered = filtered.filter(entry => 
        (typeof entry.userId === 'string' ? entry.userId : entry.userId?._id || entry.userId?.id) === selectedStudent
      );
    }

    // Meal type filter
    if (selectedMealType && selectedMealType !== 'all') {
      filtered = filtered.filter(entry => entry.mealType === selectedMealType);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(entry => new Date(entry.entryDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(entry => new Date(entry.entryDate) <= new Date(dateTo));
    }

    setFilteredEntries(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStudent('all');
    setSelectedMealType('all');
    setDateFrom('');
    setDateTo('');
  };

  const exportToPDF = () => {
    try {
      // const fileName = generateMealEntriesPDF({
      //   filteredEntries,
      //   users,
      //   filters: {
      //     dateFrom,
      //     dateTo,
      //     selectedStudent,
      //     selectedMealType
      //   }
      // });

      // toast({ 
      //   title: "Success", 
      //   description: `PDF report "${fileName}" generated successfully!`,
      //   duration: 5000
      // });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchMealEntries()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getUsers();
      // console.log('Users response:', response);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    }
  };

  const fetchMealEntries = async () => {
    try {
      const response = await apiClient.getAllMealEntriesAdmin();
      // console.log('Meal entries response:', response);
      setMealEntries(response.entries || []);
    } catch (error) {
      console.error('Fetch meal entries error:', error);
      toast({ title: "Error", description: "Failed to fetch meal entries", variant: "destructive" });
    }
  };

  const saveUser = async (userData: Partial<User>) => {
    try {
      if (selectedUser?.id) {
        await apiClient.updateUser(selectedUser.id, userData);
        toast({ title: "Success", description: "User updated successfully" });
      } else {
        await apiClient.createUser(userData);
        toast({ title: "Success", description: "User created successfully" });
      }
      setShowUserDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save user", variant: "destructive" });
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await apiClient.deleteUser(id);
        toast({ title: "Success", description: "User deleted successfully" });
        fetchUsers();
      } catch (error: any) {
        console.error('Delete user error:', error);
        toast({ title: "Error", description: error.message || "Failed to delete user", variant: "destructive" });
      }
    }
  };

  const saveMealEntry = async (entryData: any) => {
    try {
      const dataToSave = {
        userId: entryData.userId,
        entryDate: entryData.entryDate,
        mealType: entryData.mealType,
        dishName: entryData.dishName,
        cost: entryData.cost
      };

      if (selectedEntry?.id || selectedEntry?._id) {
        await apiClient.updateMealEntry(selectedEntry.id || selectedEntry._id, dataToSave);
        toast({ title: "Success", description: "Meal entry updated successfully" });
      } else {
        await apiClient.createMealEntry(dataToSave);
        toast({ title: "Success", description: "Meal entry created successfully" });
      }
      setShowEntryDialog(false);
      setSelectedEntry(null);
      fetchMealEntries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save meal entry", variant: "destructive" });
    }
  };

  const deleteMealEntry = async (id: string) => {
    if (!id) {
      toast({ title: "Error", description: "Invalid entry ID", variant: "destructive" });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this meal entry? This action cannot be undone.')) {
      return;
    }

    try {
      // console.log('Deleting meal entry with ID:', id);
      await apiClient.deleteMealEntry(id);
      toast({ title: "Success", description: "Meal entry deleted successfully" });
      fetchMealEntries();
    } catch (error: any) {
      console.error('Delete meal entry error:', error);
      toast({ title: "Error", description: error.message || "Failed to delete meal entry", variant: "destructive" });
    }
  };
 if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-lg text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">🏠 Admin Dashboard</h1>
            <Badge variant="secondary" className="text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2 self-start">
              👑 Administrator
            </Badge>
          </div>

          <Tabs defaultValue="meal-entries" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="meal-entries" className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                🍽️ Meal Entries
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                👥 Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meal-entries" className="space-y-4">
              {/* Statistics Cards */}
              <StatsCards filteredEntries={filteredEntries} users={users} />

              {/* Filters & Export */}
              <FilterSection
                searchTerm={searchTerm}
                selectedStudent={selectedStudent}
                selectedMealType={selectedMealType}
                dateFrom={dateFrom}
                dateTo={dateTo}
                users={users}
                onSearchTermChange={setSearchTerm}
                onSelectedStudentChange={setSelectedStudent}
                onSelectedMealTypeChange={setSelectedMealType}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onClearFilters={clearFilters}
                onExportPDF={exportToPDF}
              />

              {/* Meal Entries Management */}
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                  <CardTitle className="text-lg">🍽️ Meal Entries Management</CardTitle>
                  <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedEntry(null)} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        ➕ Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="mx-4 max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedEntry ? '✏️ Edit Meal Entry' : '➕ Add New Meal Entry'}
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
                  <MealEntriesTable
                    filteredEntries={filteredEntries}
                    onEditEntry={(entry) => {
                      setSelectedEntry(entry);
                      setShowEntryDialog(true);
                    }}
                    onDeleteEntry={deleteMealEntry}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                  <CardTitle className="text-lg">👥 Users Management</CardTitle>
                  <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedUser(null)} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        ➕ Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="mx-4">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedUser ? '✏️ Edit User' : '➕ Add New User'}
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
                  <UsersTable
                    users={users}
                    onEditUser={(user) => {
                      setSelectedUser(user);
                      setShowUserDialog(true);
                    }}
                    onDeleteUser={deleteUser}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
 
} 