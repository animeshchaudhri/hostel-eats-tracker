import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Edit3, Trash2 } from 'lucide-react';
import { CreateMealPlanDialog } from './CreateMealPlanDialog';


interface MealPlansTabProps {
  mealPlans: any[];
  onCreateMealPlan: (planData: any) => void;
  onUpdateMealPlan: (planId: string, planData: any) => void;
  onDeleteMealPlan: (planId: string) => void;
}

export function MealPlansTab({ 
  mealPlans, 
  onCreateMealPlan, 
  onUpdateMealPlan, 
  onDeleteMealPlan 
}: MealPlansTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setShowCreateDialog(true);
  };

  const handleSavePlan = async (planData: any) => {
    if (editingPlan) {
      await onUpdateMealPlan(editingPlan.id, planData);
    } else {
      await onCreateMealPlan(planData);
    }
    setShowCreateDialog(false);
    setEditingPlan(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">Meal Plans</h2>
        
        <Button 
          variant="outline" 
          className="gap-2 text-sm w-full sm:w-auto"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Create Meal Plan
        </Button>
      </div>
      
      <div className="grid gap-3 sm:gap-4">
        {mealPlans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="font-medium mb-2">No Meal Plans Yet</h3>
              <p className="text-sm text-muted-foreground">Create meal plans to assign subscriptions to students.</p>
            </CardContent>
          </Card>
        ) : (
          mealPlans.map(plan => (
            <Card key={plan.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-sm sm:text-base">{plan.name}</h3>
                      <Badge className="bg-green-100 text-green-800 text-xs">₹{plan.price}</Badge>
                      <Badge variant={plan.isActive ? 'default' : 'secondary'} className="text-xs">
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">{plan.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {plan.mealTypes.map((type: string) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-xs text-muted-foreground break-words">
                      {plan.totalMeals} meals • Features: {plan.features.join(', ')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() => onDeleteMealPlan(plan.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateMealPlanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        editingPlan={editingPlan}
        onSave={handleSavePlan}
      />
    </div>
  );
}
