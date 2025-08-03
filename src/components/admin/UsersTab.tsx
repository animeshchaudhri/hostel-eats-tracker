import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit3, Trash2, Crown } from 'lucide-react';
import { CreateUserDialog } from './CreateUserDialog';


interface UsersTabProps {
  users: any[];
  subscriptions: any[];
  onCreateUser: (userData: any) => void;
  onUpdateUser: (userId: string, userData: any) => void;
  onDeleteUser: (userId: string) => void;
}

export function UsersTab({ 
  users, 
  subscriptions, 
  onCreateUser, 
  onUpdateUser, 
  onDeleteUser 
}: UsersTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowCreateDialog(true);
  };

  const handleSaveUser = async (userData: any) => {
    if (editingUser) {
      await onUpdateUser(editingUser.id, userData);
    } else {
      await onCreateUser(userData);
    }
    setShowCreateDialog(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">👥 User Management</h2>
        
        <Button 
          variant="outline" 
          className="gap-2 text-sm w-full sm:w-auto"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <div className="grid gap-3 sm:gap-4">
        {users.map(user => {
          const userSubscriptions = subscriptions.filter(s => s.userId.id === user.id);
          const activeSubscription = userSubscriptions.find(s => s.status === 'active');
          
          return (
            <Card key={user.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-sm sm:text-base">{user.name}</h3>
                      <Badge variant="outline" className="text-xs">Room {user.roomNumber}</Badge>
                      {user.isAdmin && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          Admin
                        </Badge>
                      )}
                      {activeSubscription && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Subscribed
                        </Badge>
                      )}
                    </div>
                    
                    {activeSubscription && (
                      <div className="text-xs sm:text-sm space-y-1">
                        <p className="text-muted-foreground">
                          Plan: {activeSubscription.mealPlanId.name}
                        </p>
                        <p className="text-muted-foreground">
                          Remaining Meals: {activeSubscription.remainingMeals}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Login Code: {user.loginCode}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        editingUser={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
