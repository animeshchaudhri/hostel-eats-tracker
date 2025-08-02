import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, ChevronDown, ChevronRight, Clock, X, Check } from "lucide-react";
import { useState } from "react";

interface MealEntry {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  dish: string;
  cost: number;
}

interface DailyLogTableProps {
  entries: MealEntry[];
}

const mealIcons = {
  breakfast: "🍳",
  lunch: "🍛", 
  dinner: "🍽️"
};

const mealColors = {
  breakfast: "bg-breakfast-bg border-breakfast-border",
  lunch: "bg-lunch-bg border-lunch-border", 
  dinner: "bg-dinner-bg border-dinner-border"
};

export const DailyLogTable = ({ entries }: DailyLogTableProps) => {
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, MealEntry[]>);

  // Sort dates (most recent first)
  const sortedDates = Object.keys(entriesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const toggleDay = (date: string) => {
    const newOpenDays = new Set(openDays);
    if (newOpenDays.has(date)) {
      newOpenDays.delete(date);
    } else {
      newOpenDays.add(date);
    }
    setOpenDays(newOpenDays);
  };

  const getMealStatus = (dayEntries: MealEntry[], mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const mealEntry = dayEntries.find(entry => entry.meal === mealType);
    return mealEntry ? { status: 'present', entry: mealEntry } : { status: 'skipped', entry: null };
  };

  const getDayTotal = (dayEntries: MealEntry[]) => {
    return dayEntries.reduce((sum, entry) => sum + entry.cost, 0);
  };

  return (
    <div className="space-y-4 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Calendar className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Daily Meal Log</h2>
      </div>

      {/* Daily Entries */}
      <div className="space-y-3">
        {sortedDates.length === 0 ? (
          <Card className="p-8 text-center shadow-card border-0">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No meal entries found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your daily meals will appear here once you start tracking.
            </p>
          </Card>
        ) : (
          sortedDates.map((date, index) => {
            const dayEntries = entriesByDate[date];
            const dayTotal = getDayTotal(dayEntries);
            const isOpen = openDays.has(date);
            const dateObj = new Date(date);
            const isToday = dateObj.toDateString() === new Date().toDateString();
            
            return (
              <Card 
                key={date} 
                className="shadow-card border-0 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full p-4 h-auto justify-between hover:bg-muted/50"
                      onClick={() => toggleDay(date)}
                    >
                      <div className="flex items-center space-x-3">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div className="text-left">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-foreground">
                              {dateObj.toLocaleDateString('en-IN', {
                                weekday: 'long',
                                month: 'long', 
                                day: 'numeric'
                              })}
                            </h3>
                            {isToday && (
                              <Badge variant="secondary" className="text-xs">
                                Today
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {dayEntries.length} meal{dayEntries.length !== 1 ? 's' : ''} logged
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">₹{dayTotal}</div>
                        <div className="flex space-x-1 mt-1">
                          {['breakfast', 'lunch', 'dinner'].map((meal) => {
                            const mealStatus = getMealStatus(dayEntries, meal as any);
                            return (
                              <div
                                key={meal}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  mealStatus.status === 'present' 
                                    ? 'bg-success text-success-foreground' 
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {mealStatus.status === 'present' ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      {/* Meal Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                          const mealStatus = getMealStatus(dayEntries, mealType as any);
                          
                          return (
                            <Card 
                              key={mealType}
                              className={`p-3 ${
                                mealStatus.status === 'present' 
                                  ? mealColors[mealType as keyof typeof mealColors]
                                  : 'bg-muted/30 border-muted'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">
                                    {mealIcons[mealType as keyof typeof mealIcons]}
                                  </span>
                                  <div>
                                    <p className="font-medium capitalize text-sm">{mealType}</p>
                                    {mealStatus.status === 'present' ? (
                                      <p className="text-xs text-muted-foreground">
                                        {mealStatus.entry!.dish}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">Skipped</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {mealStatus.status === 'present' ? (
                                    <div className="text-sm font-semibold">
                                      ₹{mealStatus.entry!.cost}
                                    </div>
                                  ) : (
                                    <X className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};