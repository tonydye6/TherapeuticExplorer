import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlternativeTreatment } from '@shared/schema';
import { 
  Apple, Utensils, FilePlus, Clock, Calendar, 
  ShoppingBag, Download, Printer, CheckCircle,
  AlertTriangle, Info, FileText, Coffee, ChefHat
} from 'lucide-react';

interface NutritionalApproachesProps {
  treatment: AlternativeTreatment;
}

export default function NutritionalApproaches({ treatment }: NutritionalApproachesProps) {
  const nutritionPlans = [
    {
      id: 'anti-inflammatory',
      name: 'Anti-Inflammatory Diet',
      description: 'Focus on reducing inflammation through whole foods',
      color: 'green',
      keyFoods: [
        'Fatty fish (salmon, mackerel)',
        'Leafy greens',
        'Berries and cherries',
        'Nuts and seeds', 
        'Olive oil',
        'Turmeric and ginger'
      ],
      avoidFoods: [
        'Refined sugars',
        'Processed meats',
        'Fried foods',
        'Excessive alcohol',
        'Trans fats',
        'Refined flours'
      ],
      sampleMeal: {
        breakfast: 'Greek yogurt with berries, walnuts, and honey',
        lunch: 'Salmon salad with mixed greens, avocado, and olive oil dressing',
        dinner: 'Turmeric-spiced chicken with roasted vegetables and quinoa',
        snacks: 'Apple slices with almond butter; handful of mixed nuts'
      }
    },
    {
      id: 'immune-support',
      name: 'Immune Support Diet',
      description: 'Enhance immune function with nutrient-dense foods',
      color: 'blue',
      keyFoods: [
        'Citrus fruits',
        'Red bell peppers',
        'Broccoli and spinach',
        'Garlic and onions',
        'Yogurt with live cultures',
        'Mushrooms (shiitake, maitake)'
      ],
      avoidFoods: [
        'Added sugars',
        'Highly processed foods',
        'Excessive dairy',
        'Refined carbohydrates',
        'Excessive salt',
        'Artificial additives'
      ],
      sampleMeal: {
        breakfast: 'Smoothie with spinach, orange, ginger, and yogurt',
        lunch: 'Vegetable soup with garlic, onions, mushrooms and herbs',
        dinner: 'Baked chicken with roasted broccoli, sweet potatoes and garlic',
        snacks: 'Red bell pepper slices with hummus; orange segments'
      }
    },
    {
      id: 'plant-based',
      name: 'Plant-Focused Diet',
      description: 'Predominantly plant-based foods for phytonutrient benefits',
      color: 'purple',
      keyFoods: [
        'Colorful vegetables and fruits',
        'Legumes (beans, lentils, chickpeas)',
        'Whole grains',
        'Nuts and seeds',
        'Plant-based proteins',
        'Fermented foods'
      ],
      avoidFoods: [
        'Red and processed meats',
        'Refined grains',
        'Sugary beverages',
        'Fast food',
        'Heavily processed plant foods',
        'High-sodium packaged foods'
      ],
      sampleMeal: {
        breakfast: 'Overnight oats with chia seeds, berries, and plant milk',
        lunch: 'Buddha bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing',
        dinner: 'Lentil soup with mixed vegetables and whole grain bread',
        snacks: 'Trail mix with nuts, seeds, and dried fruits; vegetable sticks'
      }
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="mr-2 h-5 w-5" />
            Nutritional Approaches
          </CardTitle>
          <CardDescription>
            Dietary strategies that may complement {treatment.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              <Info className="h-4 w-4 inline mr-1" />
              The following nutritional approaches are based on general principles and research. 
              They should be customized to your specific needs with the help of a nutritionist 
              or dietitian familiar with cancer care.
            </p>
          </div>

          <Tabs defaultValue={nutritionPlans[0].id}>
            <TabsList className="mb-4">
              {nutritionPlans.map(plan => (
                <TabsTrigger key={plan.id} value={plan.id}>
                  <Apple className="mr-2 h-4 w-4" />
                  {plan.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {nutritionPlans.map(plan => (
              <TabsContent key={plan.id} value={plan.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <Badge variant="outline" className={`bg-${plan.color}-50 text-${plan.color}-700 border-${plan.color}-200`}>
                    Nutritional Plan
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> 
                      Foods to Include
                    </h4>
                    <ul className="space-y-1 ml-6 list-disc text-sm">
                      {plan.keyFoods.map((food, index) => (
                        <li key={index}>{food}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" /> 
                      Foods to Minimize
                    </h4>
                    <ul className="space-y-1 ml-6 list-disc text-sm">
                      {plan.avoidFoods.map((food, index) => (
                        <li key={index}>{food}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" /> 
                    Sample Meal Plan
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium flex items-center">
                          <Coffee className="h-4 w-4 mr-1 text-amber-600" /> Breakfast
                        </h5>
                        <p className="text-sm ml-5">{plan.sampleMeal.breakfast}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium flex items-center">
                          <Utensils className="h-4 w-4 mr-1 text-blue-500" /> Lunch
                        </h5>
                        <p className="text-sm ml-5">{plan.sampleMeal.lunch}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium flex items-center">
                          <ChefHat className="h-4 w-4 mr-1 text-indigo-500" /> Dinner
                        </h5>
                        <p className="text-sm ml-5">{plan.sampleMeal.dinner}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium flex items-center">
                          <Apple className="h-4 w-4 mr-1 text-green-500" /> Snacks
                        </h5>
                        <p className="text-sm ml-5">{plan.sampleMeal.snacks}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ShoppingBag className="mr-1 h-4 w-4" /> Generate Shopping List
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Printer className="mr-1 h-4 w-4" /> Print Plan
                    </Button>
                  </div>
                  
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FileText className="mr-1 h-4 w-4" /> Full Recipe Guide
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="bg-muted p-4 rounded-md mt-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Personalization Reminder</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  These meal plans are suggestions only. Individual nutritional needs vary based on treatment, 
                  medical history, and personal factors. Please consult with a registered dietitian or your
                  healthcare team to develop a personalized plan that meets your specific needs.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}