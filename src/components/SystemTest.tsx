import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/lib/apiClient';

export function SystemTest() {
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    try {
      setTestResults(prev => ({ ...prev, [testName]: 'Running...' }));
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: `✅ Success: ${JSON.stringify(result).slice(0, 100)}...` }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: `❌ Error: ${error.message}` }));
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults({});

    // Test 1: Check if meal plans exist
    await runTest('Meal Plans', async () => {
      const response = await apiClient.getMealPlans();
      return `Found ${response.plans?.length || 0} meal plans`;
    });

    // Test 2: Check if extra items exist
    await runTest('Extra Items', async () => {
      const response = await apiClient.getExtraItems();
      return `Found ${response.items?.length || 0} extra items`;
    });

    // Test 3: Check users
    await runTest('Users', async () => {
      const response = await apiClient.getUsers();
      return `Found ${response.users?.length || 0} users`;
    });

    // Test 4: Check subscriptions
    await runTest('Subscriptions', async () => {
      const response = await apiClient.getAllSubscriptions();
      return `Found ${response.subscriptions?.length || 0} subscriptions`;
    });

    // Test 5: Check user's subscriptions
    await runTest('My Subscriptions', async () => {
      const response = await apiClient.getMySubscriptions();
      return `Found ${response.subscriptions?.length || 0} user subscriptions`;
    });

    setTesting(false);
    toast({ 
      title: "Tests Complete", 
      description: "System connectivity tests finished",
      variant: "default"
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">🧪 System Connectivity Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runAllTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Running Tests...' : '🚀 Run All Tests'}
        </Button>

        <div className="space-y-2">
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className="p-3 border rounded-lg">
              <div className="font-medium">{test}</div>
              <div className="text-sm text-muted-foreground">{result}</div>
            </div>
          ))}
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              ✅ = Working correctly | ❌ = Needs attention
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
