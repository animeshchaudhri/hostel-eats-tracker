import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UtensilsCrossed, Edit3, Trash2, Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EditMealDialog } from './EditMealDialog';


interface MealHistoryTabProps {
  mealEntries: any[];
  stats: {
    totalMeals: number;
    subscriptionMeals: number;
    paidMeals: number;
  };
  onDeleteMeal: (mealId: string) => void;
  onUpdateMeal: (mealId: string, mealData: any) => void;
}

export function MealHistoryTab({ mealEntries, stats, onDeleteMeal, onUpdateMeal }: MealHistoryTabProps) {
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [mealTypeFilter, setMealTypeFilter] = useState('all');
  const [entryTypeFilter, setEntryTypeFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>();
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>();

  // Get unique values for filter dropdowns
  const uniqueUsers = useMemo(() => {
    const users = new Set();
    mealEntries.forEach(meal => {
      if (meal.userId?.name) {
        users.add(JSON.stringify({ name: meal.userId.name, id: meal.userId._id || meal.userId.id }));
      }
    });
    return Array.from(users).map(user => JSON.parse(user as string));
  }, [mealEntries]);

  // Filter meals based on all filter criteria
  const filteredMeals = useMemo(() => {
    return mealEntries.filter(meal => {
      // Name filter (dish name)
      if (nameFilter && !meal.dishName?.toLowerCase().includes(nameFilter.toLowerCase())) {
        return false;
      }

      // User filter
      if (userFilter && userFilter !== 'all' && meal.userId?.name !== userFilter) {
        return false;
      }

      // Meal type filter
      if (mealTypeFilter && mealTypeFilter !== 'all' && meal.mealType !== mealTypeFilter) {
        return false;
      }

      // Entry type filter
      if (entryTypeFilter && entryTypeFilter !== 'all') {
        const isSubscription = meal.entryType === 'subscription' || meal.cost === 0;
        if (entryTypeFilter === 'subscription' && !isSubscription) return false;
        if (entryTypeFilter === 'paid' && isSubscription) return false;
      }

      // Date range filter
      if (dateFromFilter || dateToFilter) {
        const mealDate = new Date(meal.entryDate);
        if (dateFromFilter && mealDate < dateFromFilter) return false;
        if (dateToFilter && mealDate > dateToFilter) return false;
      }

      return true;
    });
  }, [mealEntries, nameFilter, userFilter, mealTypeFilter, entryTypeFilter, dateFromFilter, dateToFilter]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const totalMeals = filteredMeals.length;
    const subscriptionMeals = filteredMeals.filter(meal => 
      meal.entryType === 'subscription' || meal.cost === 0
    ).length;
    const paidMeals = totalMeals - subscriptionMeals;
    const totalRevenue = filteredMeals.reduce((sum, meal) => 
      sum + (meal.totalCost || meal.cost || 0), 0
    );

    return { totalMeals, subscriptionMeals, paidMeals, totalRevenue };
  }, [filteredMeals]);

  const clearAllFilters = () => {
    setNameFilter('');
    setUserFilter('all');
    setMealTypeFilter('all');
    setEntryTypeFilter('all');
    setDateFromFilter(undefined);
    setDateToFilter(undefined);
  };

  const activeFiltersCount = [
    nameFilter,
    userFilter !== 'all' ? userFilter : '',
    mealTypeFilter !== 'all' ? mealTypeFilter : '',
    entryTypeFilter !== 'all' ? entryTypeFilter : '',
    dateFromFilter,
    dateToFilter
  ].filter(Boolean).length;

  const handleEditMeal = (meal: any) => {
    setEditingMeal(meal);
    setShowEditDialog(true);
  };

  const handleUpdateMeal = async (updatedMeal: any) => {
    await onUpdateMeal(editingMeal.id || editingMeal._id, updatedMeal);
    setShowEditDialog(false);
    setEditingMeal(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">📈 Meal History & Analytics</h2>
        <div className="flex items-center justify-around	 gap-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing {filteredMeals.length} of {mealEntries.length} meals
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 ml-3 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">🔍 Filter Options</CardTitle>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name Filter */}
              <div className="space-y-2">
                <Label htmlFor="nameFilter">Dish Name</Label>
                <Input
                  id="nameFilter"
                  placeholder="Search by dish name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>

              {/* User Filter */}
              <div className="space-y-2">
                <Label htmlFor="userFilter">Student</Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All students</SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user.id} value={user.name}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meal Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="mealTypeFilter">Meal Type</Label>
                <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All meal types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All meal types</SelectItem>
                    <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
                    <SelectItem value="lunch">🍛 Lunch</SelectItem>
                    <SelectItem value="dinner">🍽️ Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Entry Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="entryTypeFilter">Payment Type</Label>
                <Select value={entryTypeFilter} onValueChange={setEntryTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All payment types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payment types</SelectItem>
                    <SelectItem value="subscription">📋 Subscription</SelectItem>
                    <SelectItem value="paid">💰 Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From Filter */}
              <div className="space-y-2">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFromFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFromFilter ? format(dateFromFilter, "PPP") : <span>Pick start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFromFilter}
                      onSelect={setDateFromFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateToFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateToFilter ? format(dateToFilter, "PPP") : <span>Pick end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateToFilter}
                      onSelect={setDateToFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary for Filtered Results */}
      {filteredMeals.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{filteredStats.totalMeals}</p>
                <p className="text-xs text-muted-foreground">Total Meals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{filteredStats.subscriptionMeals}</p>
                <p className="text-xs text-muted-foreground">Subscription</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{filteredStats.paidMeals}</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">₹{filteredStats.totalRevenue}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-3 sm:gap-4">
        {filteredMeals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <UtensilsCrossed className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="font-medium mb-2">
                {mealEntries.length === 0 ? 'No Meal Entries Yet' : 'No Matching Meals Found'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {mealEntries.length === 0 
                  ? 'Start adding meals to see history here.' 
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-3">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredMeals.length > 50 && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing first 50 of {filteredMeals.length} results. Use filters to narrow down your search.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {filteredMeals.slice(0, 50).map(meal => (
            <Card key={meal.id || meal._id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-sm sm:text-base">{meal.dishName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {meal.mealType}
                      </Badge>
                      {meal.entryType === 'subscription' ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          FREE (Subscription)
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          ₹{meal.cost || meal.totalCost}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {meal.userId?.name || 'Unknown User'} • Room {meal.userId?.roomNumber || 'N/A'} • 
                      {meal.entryDate ? new Date(meal.entryDate).toLocaleDateString() : 'No date'}
                    </p>
                    
                    {meal.extraItems && meal.extraItems.length > 0 && (
                      <div className="text-xs text-blue-600">
                        Extras: {meal.extraItems.map((item: any) => 
                          `${item.itemName || item.name} x${item.quantity}`
                        ).join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-medium text-sm">₹{meal.totalCost || meal.cost || 0}</p>
                      {meal.entryType === 'subscription' && (meal.totalCost || 0) > 0 && (
                        <p className="text-xs text-muted-foreground">Extras only</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMeal(meal)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteMeal(meal.id || meal._id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </>
        )}
      </div>

      <EditMealDialog
        meal={editingMeal}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleUpdateMeal}
      />
    </div>
  );
}
