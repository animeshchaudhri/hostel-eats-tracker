import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface MealEntry {
  id: string;
  _id?: string;
  userId: any;
  entryDate: string;
  mealType: string;
  dishName: string;
  cost: number;
}

interface MealEntriesTableProps {
  filteredEntries: MealEntry[];
  onEditEntry: (entry: MealEntry) => void;
  onDeleteEntry: (id: string) => void;
  loading?: boolean;
}

export function MealEntriesTable({ filteredEntries, onEditEntry, onDeleteEntry, loading }: MealEntriesTableProps) {
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🍛';
      case 'dinner': return '🍽️';
      default: return '🍽️';
    }
  };

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="block lg:hidden space-y-3">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <div key={entry.id || entry._id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {getMealIcon(entry.mealType)} {entry.mealType}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      📅 {new Date(entry.entryDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">🍴 {entry.dishName}</p>
                  <p className="text-sm text-gray-600">
                    👤 {entry.userId?.name || 'Unknown'} • 🏠 Room {entry.userId?.roomNumber || 'N/A'}
                  </p>
                </div>
                <p className="font-bold text-lg text-green-600">₹{entry.cost.toFixed(2)}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditEntry(entry)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  ✏️ Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteEntry(entry.id || entry._id || '')}
                  className="flex-1"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  🗑️ Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-500 text-lg">No meal entries found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or add some meal entries</p>
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">📅 Date</TableHead>
              <TableHead className="font-semibold">👤 Student</TableHead>
              <TableHead className="font-semibold">🏠 Room</TableHead>
              <TableHead className="font-semibold">🍽️ Meal</TableHead>
              <TableHead className="font-semibold">🍴 Dish</TableHead>
              <TableHead className="font-semibold">💰 Cost</TableHead>
              <TableHead className="font-semibold">⚙️ Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id || entry._id} className="hover:bg-gray-50">
                  <TableCell>{new Date(entry.entryDate).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell className="font-medium">{entry.userId?.name || 'Unknown'}</TableCell>
                  <TableCell>{entry.userId?.roomNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white">
                      {getMealIcon(entry.mealType)} {entry.mealType}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{entry.dishName}</TableCell>
                  <TableCell className="font-bold text-green-600">₹{entry.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditEntry(entry)}
                        title="Edit entry"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteEntry(entry.id || entry._id || '')}
                        title="Delete entry"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-gray-500 text-lg">
                    {loading ? '⏳ Loading meal entries...' : 'No meal entries found'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {loading ? 'Please wait...' : 'Try adjusting your filters or add some meal entries'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
