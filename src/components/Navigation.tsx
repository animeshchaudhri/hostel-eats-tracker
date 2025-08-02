import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, PieChart, Calendar, Menu } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'daily-log', label: 'Daily Log', icon: Calendar },
    { id: 'summary', label: 'Summary', icon: PieChart },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden md:flex items-center justify-center p-2 shadow-card border-0 bg-gradient-card sticky top-4 z-10 mx-4">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Menu Button */}
        <Card className="fixed top-4 right-4 z-20 p-2 shadow-card border-0 bg-gradient-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 p-0"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </Card>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-15 bg-background/80 backdrop-blur-sm">
            <Card className="absolute top-16 right-4 p-4 shadow-hover border-0 bg-gradient-card min-w-[200px]">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => {
                        onTabChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full justify-start space-x-2 transition-all duration-300 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Bottom Tab Bar for Mobile */}
        <Card className="fixed bottom-0 left-0 right-0 z-10 p-2 shadow-hover border-0 bg-gradient-card rounded-t-xl">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center space-y-1 py-3 px-2 h-auto transition-all duration-300 ${
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
};