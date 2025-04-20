import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlternativeTreatment } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, Microscope, FlaskConical, 
  Star, ShieldCheck, Clock, Activity, Pill, Zap, 
  Heart, CheckSquare, AlertCircle, Info
} from 'lucide-react';

interface TreatmentVisualizationProps {
  treatment: AlternativeTreatment;
}

export default function TreatmentVisualization({ treatment }: TreatmentVisualizationProps) {
  // Data for complementary approach pie chart
  const complementaryData = [
    { name: 'Symptom Relief', value: 35, color: '#4CAF50' },
    { name: 'Quality of Life', value: 25, color: '#2196F3' },
    { name: 'Immune Support', value: 15, color: '#FFC107' },
    { name: 'Side Effect Management', value: 15, color: '#9C27B0' },
    { name: 'Emotional Wellbeing', value: 10, color: '#F44336' },
  ];

  // Data for conventional treatment comparison
  const comparisonData = {
    conventional: {
      pros: [
        'Directly targets cancer cells',
        'Evidence-based protocols',
        'Monitored by oncology team',
        'Insurance coverage'
      ],
      cons: [
        'Potential severe side effects',
        'May impact healthy cells',
        'High treatment burden',
        'Limited personalization'
      ]
    },
    alternative: {
      pros: [
        'Potential quality of life improvements',
        'Holistic approach to wellness',
        'Patient-driven care',
        'May reduce side effects'
      ],
      cons: [
        'Limited direct evidence',
        'Potential interactions',
        'Unregulated quality',
        'Out-of-pocket expenses'
      ]
    }
  };

  // Helper function to render the appropriate icon based on benefit type
  const renderBenefitIcon = (benefit: string) => {
    switch (benefit) {
      case 'Symptom Relief':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'Quality of Life':
        return <Heart className="h-4 w-4 text-blue-500" />;
      case 'Immune Support':
        return <ShieldCheck className="h-4 w-4 text-yellow-500" />;
      case 'Side Effect Management':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'Emotional Wellbeing':
        return <Zap className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="mr-2 h-5 w-5" />
            Complementary Approach Analysis
          </CardTitle>
          <CardDescription>
            How this treatment might complement conventional cancer care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Visual Chart</TabsTrigger>
              <TabsTrigger value="comparison">Treatment Comparison</TabsTrigger>
              <TabsTrigger value="integration">Integration Guide</TabsTrigger>
            </TabsList>
            
            {/* Chart View */}
            <TabsContent value="chart" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complementaryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {complementaryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Potential Benefits</h3>
                  <ul className="space-y-2">
                    {complementaryData.map((item) => (
                      <li key={item.name} className="flex items-center">
                        {renderBenefitIcon(item.name)}
                        <span className="ml-2">{item.name} - <strong>{item.value}%</strong> potential impact</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    <Info className="h-4 w-4 inline mr-1" /> 
                    This analysis represents a general pattern based on available research and is not 
                    personalized to individual situations.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Comparison View */}
            <TabsContent value="comparison">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="text-lg font-medium">Conventional Treatment</h3>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <CheckSquare className="h-4 w-4 mr-1 text-green-500" /> Advantages
                    </h4>
                    <ul className="space-y-1 ml-6 list-disc text-sm">
                      {comparisonData.conventional.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 mr-1 text-red-500" /> Limitations
                    </h4>
                    <ul className="space-y-1 ml-6 list-disc text-sm">
                      {comparisonData.conventional.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-green-500" />
                    <h3 className="text-lg font-medium">Alternative Approach</h3>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <CheckSquare className="h-4 w-4 mr-1 text-green-500" /> Potential Benefits
                    </h4>
                    <ul className="space-y-1 ml-6 list-disc text-sm">
                      {comparisonData.alternative.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 mr-1 text-red-500" /> Considerations
                    </h4>
                    <ul className="space-y-1 ml-6 list-disc text-sm">
                      {comparisonData.alternative.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" /> Important Disclaimer
                </h4>
                <p className="text-sm text-muted-foreground">
                  This comparison is for informational purposes only and should not be used as a substitute 
                  for professional medical advice. Always consult with your healthcare provider before 
                  starting any alternative or complementary treatments.
                </p>
              </div>
            </TabsContent>
            
            {/* Integration Guide */}
            <TabsContent value="integration">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-500" />
                    Timing Considerations
                  </h3>
                  <p className="text-sm">
                    When integrating {treatment.name} with conventional treatments, timing can be critical.
                    Some alternative approaches work best when:
                  </p>
                  <ul className="mt-2 space-y-1 ml-6 list-disc text-sm">
                    <li>Taken at least 2 hours before or after medications</li>
                    <li>Used on days between treatment cycles</li>
                    <li>Incorporated into daily routines for consistent benefit</li>
                    <li>Introduced gradually to monitor for any adverse effects</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                    Communication Protocol
                  </h3>
                  <p className="text-sm">
                    Successful integration requires open communication with your healthcare team:
                  </p>
                  <ul className="mt-2 space-y-1 ml-6 list-disc text-sm">
                    <li>Maintain a complete list of all supplements and approaches</li>
                    <li>Share this information with all healthcare providers</li>
                    <li>Report any side effects or changes in symptoms promptly</li>
                    <li>Request regular assessments to evaluate effectiveness</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-500" />
                    Monitoring Strategy
                  </h3>
                  <p className="text-sm">
                    Track your experience with this complementary approach:
                  </p>
                  <ul className="mt-2 space-y-1 ml-6 list-disc text-sm">
                    <li>Keep a journal of benefits and side effects</li>
                    <li>Note any changes in quality of life measures</li>
                    <li>Document any impact on conventional treatment side effects</li>
                    <li>Share this documentation with your healthcare team</li>
                  </ul>
                </div>
                
                <div className="bg-muted p-4 rounded-md mt-4">
                  <Badge variant="outline" className="mb-2">Oncologist Consultation Recommended</Badge>
                  <p className="text-sm text-muted-foreground">
                    This integration guide is general and not specific to your condition or treatment plan.
                    Always consult with your oncology team before implementing any complementary approach.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}