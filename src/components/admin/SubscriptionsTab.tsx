import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Plus, Edit3, Trash2 } from 'lucide-react';
import { CreateSubscriptionDialog } from './CreateSubscriptionDialog';
import { EditSubscriptionDialog } from './EditSubscriptionDialog';


interface SubscriptionsTabProps {
  subscriptions: any[];
  users: any[];
  mealPlans: any[];
  onCreateSubscription: (subscriptionData: any) => void;
  onUpdateSubscription: (subscriptionId: string, subscriptionData: any) => void;
  onCancelSubscription: (subscriptionId: string) => void;
}

export function SubscriptionsTab({ 
  subscriptions, 
  users, 
  mealPlans, 
  onCreateSubscription, 
  onUpdateSubscription, 
  onCancelSubscription 
}: SubscriptionsTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEditSubscription = (subscription: any) => {
    setEditingSubscription(subscription);
    setShowEditDialog(true);
  };

  const handleUpdateSubscription = async (updatedData: any) => {
    await onUpdateSubscription(editingSubscription.id, updatedData);
    setShowEditDialog(false);
    setEditingSubscription(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">Student Subscriptions</h2>
        
        <Button 
          variant="outline" 
          className="gap-2 text-sm w-full sm:w-auto"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Assign Subscription
        </Button>
      </div>
      
      <div className="grid gap-3 sm:gap-4">
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <Crown className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="font-medium mb-2">No Subscriptions Yet</h3>
              <p className="text-sm text-muted-foreground">Create meal plans first, then assign subscriptions to students.</p>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map(subscription => (
            <Card key={subscription.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-sm sm:text-base">{subscription.userId.name}</h3>
                      <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {subscription.status}
                      </Badge>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Room {subscription.userId.roomNumber} • {subscription.mealPlanId.name}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="text-muted-foreground">Remaining:</span>
                        <span className="ml-1 font-medium">{subscription.remainingMeals}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-1 font-medium">₹{subscription.totalAmount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Paid:</span>
                        <span className="ml-1 font-medium text-green-600">₹{subscription.amountPaid}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="ml-1 font-medium text-orange-600">
                          ₹{subscription.totalAmount - subscription.amountPaid}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditSubscription(subscription)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() => onCancelSubscription(subscription.id)}
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

      <CreateSubscriptionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        users={users}
        mealPlans={mealPlans}
        onSave={onCreateSubscription}
      />

      <EditSubscriptionDialog
        subscription={editingSubscription}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleUpdateSubscription}
      />
    </div>
  );
}
