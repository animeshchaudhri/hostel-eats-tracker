import { Card, CardContent } from "@/components/ui/card";
import { Users, Crown, DollarSign, TrendingUp } from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalStudents: number;
    activeSubscriptions: number;
    totalRevenue: number;
    pendingPayments: number;
    totalMeals: number;
    subscriptionMeals: number;
    paidMeals: number;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Students</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-lg sm:text-2xl font-bold">₹{stats.totalRevenue}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Pending Payments</p>
              <p className="text-lg sm:text-2xl font-bold">₹{stats.pendingPayments}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
