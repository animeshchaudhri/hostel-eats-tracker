import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { UtensilsCrossed, Users, CreditCard, BarChart3 } from "lucide-react";

const Landing = () => {
  const [loginCode, setLoginCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithCode } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCode.trim()) return;
    
    setLoading(true);
    try {
      const result = await signInWithCode(loginCode.trim());
      if (result.error) {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Hostel Eats Tracker</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Hero content */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Track Your Hostel
              <span className="text-blue-600"> Meals & Expenses</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Manage your hostel meal subscriptions, track daily expenses, and get insights into your food spending - all in one place.
            </p>
            
            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Users className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">Easy student & admin access</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <CreditCard className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Subscriptions</h3>
                  <p className="text-sm text-gray-600">Meal plan management</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <UtensilsCrossed className="h-6 w-6 text-orange-600 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Meal Tracking</h3>
                  <p className="text-sm text-gray-600">Log daily meals & extras</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <BarChart3 className="h-6 w-6 text-purple-600 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Spending insights & reports</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Enter your login code to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginCode">Login Code</Label>
                    <Input
                      id="loginCode"
                      type="text"
                      placeholder="e.g., STUD001, ADMIN001"
                      value={loginCode}
                      onChange={(e) => setLoginCode(e.target.value)}
                      required
                      className="text-center text-lg"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !loginCode.trim()}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                
                <div className="mt-6 pt-6 border-t text-center">
                  <p className="text-sm text-gray-600">
                    Don't have a login code? Contact your hostel administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>&copy; 2025 Hostel Eats Tracker. Built for efficient hostel meal management.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
