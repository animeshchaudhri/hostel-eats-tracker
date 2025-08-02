import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [loginCode, setLoginCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signInWithCode } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCode.trim()) return;

    setLoading(true);
    const { error } = await signInWithCode(loginCode.trim().toUpperCase());
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome!",
        description: "You have been logged in successfully.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            🍽️ Mess Tracker
          </CardTitle>
          <CardDescription>
            Enter your login code to access your meal tracking dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="loginCode" className="text-sm font-medium">
                Login Code
              </label>
              <Input
                id="loginCode"
                type="text"
                placeholder="Enter your code (e.g., ANIM001)"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                className="text-center tracking-wider font-mono"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !loginCode.trim()}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}