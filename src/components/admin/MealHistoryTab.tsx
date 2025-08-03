import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Edit3, Trash2 } from 'lucide-react';
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
        <p className="text-xs sm:text-sm text-muted-foreground">
          Total: {stats.totalMeals} meals | Subscription: {stats.subscriptionMeals} | Paid: {stats.paidMeals}
        </p>
      </div>
      
      <div className="grid gap-3 sm:gap-4">
        {mealEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <UtensilsCrossed className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="font-medium mb-2">No Meal Entries Yet</h3>
              <p className="text-sm text-muted-foreground">Start adding meals to see history here.</p>
            </CardContent>
          </Card>
        ) : (
          mealEntries.slice(0, 20).map(meal => (
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
          ))
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
