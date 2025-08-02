import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, FileText, Calendar, Users } from 'lucide-react';

interface MealEntry {
  id: string;
  _id?: string;
  userId: any;
  entryDate: string;
  mealType: string;
  dishName: string;
  cost: number;
}

interface User {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
  isActive?: boolean;
}

interface StatsCardsProps {
  filteredEntries: MealEntry[];
  users: User[];
}

export function StatsCards({ filteredEntries, users }: StatsCardsProps) {
  const totalCost = filteredEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const thisMonthEntries = filteredEntries.filter(e => 
    new Date(e.entryDate).getMonth() === new Date().getMonth() &&
    new Date(e.entryDate).getFullYear() === new Date().getFullYear()
  ).length;
  const activeStudents = users.filter(u => !u.isAdmin && u.isActive !== false).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Entries</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{filteredEntries.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">₹{totalCost.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">This Month</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{thisMonthEntries}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Active Students</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{activeStudents}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
