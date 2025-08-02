import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiClient from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { UtensilsCrossed, Calendar, TrendingUp, DollarSign, Eye } from 'lucide-react';

interface User {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
  isActive?: boolean; // Make this optional
}

interface MealEntry {
  _id: string;
  userId: string;
  entryDate: string;
  mealType: string;
  dishName: string;
  cost: number;
  userId_populated?: { name: string; roomNumber: string };
}

export function UserDashboard({ currentUser }: { currentUser: User }) {
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  // Filter states
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Safety check for currentUser
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">User data not available</h2>
          <p className="text-muted-foreground">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchMealEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [mealEntries, selectedMealType, dateFrom, dateTo]);

  const filterEntries = () => {
    let filtered = [...mealEntries]; // Don't filter by userId since backend already returns user-specific entries

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
    setSelectedMealType('all');
    setDateFrom('');
    setDateTo('');
  };

  const fetchMealEntries = async () => {
    setLoading(true);
    try {
      // Use the general endpoint which returns user's own entries only
      const response = await apiClient.getMealEntries();
      setMealEntries(response.entries || []);
    } catch (error) {
      console.error('Fetch meal entries error:', error);
      toast({ title: "Error", description: "Failed to fetch meal entries", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalCost = filteredEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const thisMonth = new Date().getMonth();
  const thisMonthEntries = filteredEntries.filter(e => new Date(e.entryDate).getMonth() === thisMonth);
  const thisMonthCost = thisMonthEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const avgCostPerMeal = filteredEntries.length > 0 ? totalCost / filteredEntries.length : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-20 md:pb-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentUser.name}</h1>
            <p className="text-sm text-gray-500">Room {currentUser.roomNumber}</p>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-blue-700">👤 Student</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Meals</p>
              <p className="text-lg font-bold text-gray-900">{filteredEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</p>
              <p className="text-lg font-bold text-gray-900">₹{totalCost.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">This Month</p>
              <p className="text-lg font-bold text-gray-900">₹{thisMonthCost.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Avg/Meal</p>
              <p className="text-lg font-bold text-gray-900">₹{avgCostPerMeal.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white text-center shadow-lg">
          <Eye className="h-6 w-6 mx-auto mb-2" />
          <h2 className="font-semibold text-lg">My Meal History</h2>
          <p className="text-blue-100 text-sm">View your dining records</p>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <UtensilsCrossed className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">Today's Meals</p>
          <p className="text-sm font-bold text-gray-900">
            {filteredEntries.filter(e => 
              new Date(e.entryDate).toDateString() === new Date().toDateString()
            ).length} entries
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">This Week</p>
          <p className="text-sm font-bold text-gray-900">
            ₹{filteredEntries.filter(e => {
              const entryDate = new Date(e.entryDate);
              const today = new Date();
              const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
              return entryDate >= weekStart;
            }).reduce((sum, entry) => sum + entry.cost, 0).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter Meals</h3>
        <div className="space-y-3">
          <Select value={selectedMealType} onValueChange={setSelectedMealType}>
            <SelectTrigger className="h-11 rounded-lg">
              <SelectValue placeholder="All Meals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Meals</SelectItem>
              <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
              <SelectItem value="lunch">🍛 Lunch</SelectItem>
              <SelectItem value="dinner">🍽️ Dinner</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-11 rounded-lg"
            />
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-11 rounded-lg"
            />
          </div>

          {(selectedMealType !== 'all' || dateFrom || dateTo) && (
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              className="w-full h-11 rounded-lg"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Meal Entries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Recent Meals</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredEntries.length > 0 ? (
            filteredEntries
              .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
              .slice(0, 20) // Show only recent 20 entries for mobile
              .map((entry) => (
                <div key={entry._id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-lg">
                        {entry.mealType === 'breakfast' && '🍳'}
                        {entry.mealType === 'lunch' && '🍛'}
                        {entry.mealType === 'dinner' && '🍽️'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{entry.dishName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.entryDate).toLocaleDateString()} • {entry.mealType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{entry.cost.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="p-8 text-center">
              <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-2">No meals found</p>
              <p className="text-gray-400 text-xs">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
