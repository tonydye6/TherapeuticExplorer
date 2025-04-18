import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  PlusCircle,
  Activity,
  Pill,
  Stethoscope
} from "lucide-react";

import { Treatment } from "@shared/schema";

// Sample data for the effectiveness chart
const sampleEffectivenessData = [
  { date: '2023-10-15', tumorMarker: 42, energyLevel: 5, notes: "Started new treatment" },
  { date: '2023-11-01', tumorMarker: 38, energyLevel: 4, notes: "Mild side effects" },
  { date: '2023-11-15', tumorMarker: 35, energyLevel: 3, notes: "Increased fatigue" },
  { date: '2023-12-01', tumorMarker: 30, energyLevel: 4, notes: "Feeling better" },
  { date: '2023-12-15', tumorMarker: 28, energyLevel: 6, notes: "Good response to treatment" },
  { date: '2024-01-01', tumorMarker: 25, energyLevel: 7, notes: "Continuing improvement" },
  { date: '2024-01-15', tumorMarker: 24, energyLevel: 7, notes: "Stable" },
  { date: '2024-02-01', tumorMarker: 22, energyLevel: 8, notes: "Feeling great" },
];

// Sample side effect data
const sampleSideEffectData = [
  { date: '2023-10-15', nausea: 1, fatigue: 2, pain: 0 },
  { date: '2023-11-01', nausea: 3, fatigue: 4, pain: 1 },
  { date: '2023-11-15', nausea: 2, fatigue: 5, pain: 2 },
  { date: '2023-12-01', nausea: 1, fatigue: 3, pain: 1 },
  { date: '2023-12-15', nausea: 0, fatigue: 3, pain: 0 },
  { date: '2024-01-01', nausea: 0, fatigue: 2, pain: 0 },
  { date: '2024-01-15', nausea: 1, fatigue: 2, pain: 0 },
  { date: '2024-02-01', nausea: 0, fatigue: 1, pain: 0 },
];

export default function TreatmentTracker() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Fetch treatments from API
  const { data: treatments, isLoading, error } = useQuery<Treatment[]>({
    queryKey: ['/api/treatments'],
    // If API doesn't exist yet, return empty array
    queryFn: async () => {
      try {
        const response = await fetch('/api/treatments');
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error("Error fetching treatments:", error);
        return [];
      }
    },
  });
  
  // Format dates for charts
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Treatment Tracker</h1>
          <Button className="bg-primary-800 hover:bg-primary-900">
            <Plus className="h-4 w-4 mr-2" />
            Add Treatment
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Treatment Panel */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Pill className="h-5 w-5 mr-2 text-primary-800" />
                Current Treatment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading treatments...</p>
              ) : error ? (
                <p>Error loading treatments</p>
              ) : treatments && treatments.length > 0 ? (
                <div className="space-y-4">
                  {treatments.filter(t => t.active).map((treatment) => (
                    <div key={treatment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-base">{treatment.name}</h3>
                          <p className="text-sm text-gray-500">
                            {treatment.type} • Started {new Date(treatment.startDate!).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                      {treatment.notes && (
                        <p className="mt-2 text-sm">{treatment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No active treatments found</p>
                  <Button variant="outline" className="mt-4">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Treatment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Calendar and Upcoming */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary-800" />
                Treatment Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mb-4"
              />
              
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium mb-2">Upcoming Appointments</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Oncologist Follow-up</p>
                      <p className="text-sm text-gray-500">Feb 15, 2024 • 10:30 AM</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">CT Scan</p>
                      <p className="text-sm text-gray-500">Mar 3, 2024 • 2:00 PM</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts and Metrics */}
        <div className="space-y-6">
          <Tabs defaultValue="effectiveness">
            <TabsList>
              <TabsTrigger value="effectiveness">Effectiveness Metrics</TabsTrigger>
              <TabsTrigger value="sideEffects">Side Effect Tracker</TabsTrigger>
            </TabsList>
            
            <TabsContent value="effectiveness" className="pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary-800" />
                    Treatment Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={sampleEffectivenessData.map(d => ({
                          ...d,
                          date: formatDate(d.date)
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="tumorMarker" 
                          name="Tumor Marker (CA 19-9)"
                          stroke="#0D9488" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="energyLevel" 
                          name="Energy Level (1-10)"
                          stroke="#3B82F6" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">Tumor Marker Change</p>
                      <p className="text-2xl font-semibold text-green-600">-47.6%</p>
                      <p className="text-xs text-gray-400">Since treatment start</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">Latest CA 19-9</p>
                      <p className="text-2xl font-semibold">22 U/mL</p>
                      <p className="text-xs text-gray-400">Feb 1, 2024</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">Energy Level Trend</p>
                      <p className="text-2xl font-semibold text-green-600">+60%</p>
                      <p className="text-xs text-gray-400">Since treatment start</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sideEffects" className="pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2 text-primary-800" />
                    Side Effect Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={sampleSideEffectData.map(d => ({
                          ...d,
                          date: formatDate(d.date)
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="nausea" 
                          name="Nausea (0-5)"
                          stroke="#EF4444" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="fatigue" 
                          name="Fatigue (0-5)"
                          stroke="#F59E0B" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pain" 
                          name="Pain (0-5)"
                          stroke="#8B5CF6" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Management Recommendations</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="font-medium">For Fatigue:</h4>
                        <ul className="list-disc pl-5 text-sm mt-1">
                          <li>Schedule rest periods throughout the day</li>
                          <li>Light exercise like walking when energy permits</li>
                          <li>Stay hydrated and maintain balanced nutrition</li>
                        </ul>
                      </div>
                      
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium">For Nausea:</h4>
                        <ul className="list-disc pl-5 text-sm mt-1">
                          <li>Take anti-nausea medication as prescribed</li>
                          <li>Eat small, frequent meals instead of large ones</li>
                          <li>Avoid strong smells and greasy foods</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
