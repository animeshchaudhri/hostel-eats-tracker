import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Clock, Truck, Heart } from "lucide-react";

interface MealPlan {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  mealsPerDay: number;
  totalMeals: number;
  includes: string[];
  features: string[];
  mealTypes: string[];
}

export function LandingPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      // This would be replaced with actual API call
      // const response = await fetch('/api/meal-plans');
      // const data = await response.json();
      
      // Mock data for now
      const mockPlans: MealPlan[] = [
        {
          id: '1',
          name: 'Mini Thali (Single)',
          description: 'Perfect for students who prefer either lunch or dinner',
          type: 'mini_single',
          price: 2300,
          mealsPerDay: 1,
          totalMeals: 30,
          includes: ['1 Sabji', '3 Rotis', 'Salad'],
          features: [
            '1 special meal once a week (festival meal, chicken, egg etc)',
            'Free home delivery',
            'Homely taste'
          ],
          mealTypes: ['lunch']
        },
        {
          id: '2',
          name: 'Mini Thali (Double)',
          description: 'Great value for students who want both lunch and dinner',
          type: 'mini_double',
          price: 4600,
          mealsPerDay: 2,
          totalMeals: 60,
          includes: ['1 Sabji', '3 Rotis', 'Salad'],
          features: [
            '1 special meal once a week (festival meal, chicken, egg etc)',
            'Free home delivery',
            'Homely taste'
          ],
          mealTypes: ['lunch', 'dinner']
        },
        {
          id: '3',
          name: 'Full Thali (Double)',
          description: 'Complete meal solution with all essentials included',
          type: 'full_double',
          price: 7600,
          mealsPerDay: 2,
          totalMeals: 60,
          includes: ['1 Sabji', '3 Rotis', 'Dal', 'Rice', 'Salad'],
          features: [
            '1 special meal once a week (festival meal, chicken, egg etc)',
            'Free home delivery',
            'Homely taste'
          ],
          mealTypes: ['lunch', 'dinner']
        }
      ];
      
      setMealPlans(mockPlans);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'mini_single': return 'bg-blue-50 border-blue-200';
      case 'mini_double': return 'bg-green-50 border-green-200';
      case 'full_double': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPlanBadgeColor = (type: string) => {
    switch (type) {
      case 'mini_single': return 'bg-blue-100 text-blue-800';
      case 'mini_double': return 'bg-green-100 text-green-800';
      case 'full_double': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-lg text-gray-600">Loading meal plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="text-6xl sm:text-8xl mb-6">🏠</div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              HomeMade <span className="text-orange-600">Dabba</span> 
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Delicious, homely meals delivered right to your hostel room. 
              Choose from our affordable monthly plans .
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-lg text-gray-700">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Homely Taste</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Special Weekly Meals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Plans Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🍽️ Monthly Meal Plans
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan that fits your appetite and budget. 
            All plans include special weekly meals and free home delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mealPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${getPlanColor(plan.type)}`}
            >
              {plan.type === 'mini_double' && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 text-white">
                    🏆 Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-2">
                  {plan.type === 'mini_single' ? '🥘' : 
                   plan.type === 'mini_double' ? '🍛' : '🍽️'}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <p className="text-gray-600 mt-2">{plan.description}</p>
                
                <div className="mt-4">
                  <div className="text-4xl font-bold text-gray-900">
                    ₹{plan.price.toLocaleString()}
                  </div>
                  <p className="text-gray-600">
                    per month ({plan.totalMeals} meals)
                  </p>
                  <Badge className={`mt-2 ${getPlanBadgeColor(plan.type)}`}>
                    {plan.mealsPerDay === 1 ? '1 meal/day' : '2 meals/day'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* What's Included */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    What's Included:
                  </h4>
                  <ul className="space-y-2">
                    {plan.includes.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Features:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Meal Times */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Meal Times:
                  </h4>
                  <div className="flex gap-2">
                    {plan.mealTypes.map((mealType) => (
                      <Badge key={mealType} variant="outline" className="capitalize">
                        {mealType}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg">
                  Choose This Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Extra Items Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            🍚 Extra Items Available
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Sometimes you need a little extra! Add these items to any meal for additional cost.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="p-4">
              <div className="text-2xl mb-2">🍚</div>
              <h4 className="font-semibold">Extra Rice</h4>
              <p className="text-sm text-gray-600">₹20/bowl</p>
            </Card>
            <Card className="p-4">
              <div className="text-2xl mb-2">🍲</div>
              <h4 className="font-semibold">Extra Dal</h4>
              <p className="text-sm text-gray-600">₹25/bowl</p>
            </Card>
            <Card className="p-4">
              <div className="text-2xl mb-2">🍛</div>
              <h4 className="font-semibold">Dal Rice</h4>
              <p className="text-sm text-gray-600">₹40/plate</p>
            </Card>
            <Card className="p-4">
              <div className="text-2xl mb-2">🫓</div>
              <h4 className="font-semibold">Extra Roti</h4>
              <p className="text-sm text-gray-600">₹10/piece</p>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            📞 Ready to Start?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Contact us to subscribe to a meal plan or get more information.
          </p>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
}
