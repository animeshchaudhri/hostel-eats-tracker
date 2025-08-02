import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
  isActive?: boolean;
}

interface UsersTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export function UsersTable({ users, onEditUser, onDeleteUser }: UsersTableProps) {
  return (
    <>
      {/* Mobile Card Layout */}
      <div className="block lg:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-gray-900">👤 {user.name}</p>
                <p className="text-sm text-gray-600">🏠 Room {user.roomNumber}</p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="font-mono bg-white px-2 py-1 rounded text-xs border">
                    🔑 {user.loginCode}
                  </code>
                  <Badge variant={user.isAdmin ? "default" : "secondary"} className="text-xs">
                    {user.isAdmin ? '👑 Admin' : '👤 Student'}
                  </Badge>
                  {user.isActive !== false && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✅ Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditUser(user)}
                className="flex-1"
              >
                <Edit className="h-3 w-3 mr-1" />
                ✏️ Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeleteUser(user.id)}
                disabled={user.isAdmin}
                title={user.isAdmin ? "Cannot delete admin user" : "Delete user"}
                className="flex-1"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                🗑️ Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">👤 Name</TableHead>
              <TableHead className="font-semibold">🏠 Room</TableHead>
              <TableHead className="font-semibold">🔑 Login Code</TableHead>
              <TableHead className="font-semibold">👥 Role</TableHead>
              <TableHead className="font-semibold">📊 Status</TableHead>
              <TableHead className="font-semibold">⚙️ Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>Room {user.roomNumber}</TableCell>
                <TableCell>
                  <code className="font-mono bg-muted px-2 py-1 rounded text-sm">
                    {user.loginCode}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isAdmin ? "default" : "secondary"}>
                    {user.isAdmin ? '👑 Admin' : '👤 Student'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.isActive !== false ? "outline" : "secondary"} 
                    className={user.isActive !== false ? "bg-green-50 text-green-700 border-green-200" : ""}
                  >
                    {user.isActive !== false ? '✅ Active' : '❌ Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditUser(user)}
                      title="Edit user"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteUser(user.id)}
                      disabled={user.isAdmin}
                      title={user.isAdmin ? "Cannot delete admin user" : "Delete user"}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
