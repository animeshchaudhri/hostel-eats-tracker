import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
  isActive?: boolean;
}

interface FilterSectionProps {
  searchTerm: string;
  selectedStudent: string;
  selectedMealType: string;
  dateFrom: string;
  dateTo: string;
  users: User[];
  onSearchTermChange: (value: string) => void;
  onSelectedStudentChange: (value: string) => void;
  onSelectedMealTypeChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
  onExportPDF: () => void;
}

export function FilterSection({
  searchTerm,
  selectedStudent,
  selectedMealType,
  dateFrom,
  dateTo,
  users,
  onSearchTermChange,
  onSelectedStudentChange,
  onSelectedMealTypeChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
  onExportPDF,
}: FilterSectionProps) {
  const hasActiveFilters = searchTerm || selectedStudent !== 'all' || selectedMealType !== 'all' || dateFrom || dateTo;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          📊 Filters & Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search and Export Row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="🔍 Search dishes, students, rooms..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Button onClick={onExportPDF} size="sm" className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">📄 PDF</span>
          </Button>
        </div>
        
        {/* Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Select value={selectedStudent} onValueChange={onSelectedStudentChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="👥 All Students" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">👥 All Students</SelectItem>
              {users.filter(u => !u.isAdmin).map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  👤 {user.name} (Room {user.roomNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMealType} onValueChange={onSelectedMealTypeChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="🍽️ All Meals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🍽️ All Meals</SelectItem>
              <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
              <SelectItem value="lunch">🍛 Lunch</SelectItem>
              <SelectItem value="dinner">🍽️ Dinner</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            placeholder="📅 From Date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-9"
          />

          <Input
            type="date"
            placeholder="📅 To Date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-9"
          />
        </div>
        
        {/* Clear button */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} size="sm" className="w-full">
            🗑️ Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
