import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import MedicalTimeline, { MedicalEvent, MedicalEventType } from "@/components/MedicalTimeline";
import AddTreatmentDialog from "@/components/AddTreatmentDialog";
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
  Stethoscope,
  Clock
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
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  // Sample medical events for the timeline
  const sampleMedicalEvents: MedicalEvent[] = [
    {
      id: "event1",
      date: new Date("2023-10-01"),
      eventType: "diagnosis" as MedicalEventType,
      title: "Initial Diagnosis",
      description: "Stage IV esophageal cancer with liver metastasis",
      provider: "Dr. Sarah Johnson",
      location: "Metro Cancer Center"
    },
    {
      id: "event2",
      date: new Date("2023-10-15"),
      eventType: "treatment" as MedicalEventType,
      title: "Started Chemotherapy",
      description: "FOLFOX regimen initiated",
      provider: "Dr. Michael Chen",
      location: "Metro Cancer Center"
    },
    {
      id: "event3",
      date: new Date("2023-11-05"),
      eventType: "test" as MedicalEventType,
      title: "CT Scan",
      description: "Follow-up imaging to assess treatment response",
      result: "10% reduction in primary tumor size, stable liver metastases",
      provider: "Radiology Department",
      location: "Metro Cancer Center"
    },
    {
      id: "event4",
      date: new Date("2023-11-15"),
      eventType: "symptom",
      title: "Increased Fatigue",
      description: "Patient reporting significant fatigue and some difficulty with daily activities",
      severity: 4,
    },
    {
      id: "event5",
      date: new Date("2023-12-01"),
      eventType: "medication",
      title: "Medication Adjustment",
      description: "Added Ondansetron for nausea management",
      provider: "Dr. Michael Chen",
    },
    {
      id: "event6",
      date: new Date("2023-12-15"),
      eventType: "test",
      title: "Blood Work",
      description: "Comprehensive metabolic panel and tumor markers",
      result: "CA 19-9 decreased from 42 to 30",
      provider: "Metro Cancer Center Lab",
      labValues: [
        {
          name: "CA 19-9",
          value: 30,
          unit: "U/mL",
          normalRange: "0-37 U/mL",
          isAbnormal: false
        },
        {
          name: "CEA",
          value: 4.2,
          unit: "ng/mL",
          normalRange: "0-3.0 ng/mL",
          isAbnormal: true
        },
        {
          name: "Hemoglobin",
          value: 11.5,
          unit: "g/dL",
          normalRange: "13.5-17.5 g/dL",
          isAbnormal: true
        }
      ]
    },
    {
      id: "event7",
      date: new Date("2024-01-05"),
      eventType: "scan",
      title: "PET/CT Scan",
      description: "3-month assessment of treatment response",
      result: "Partial response. Primary tumor decreased by 30%, liver metastases decreased by 15%",
      provider: "Dr. Lisa Wong",
      location: "Advanced Imaging Center"
    },
    {
      id: "event8",
      date: new Date("2024-01-20"),
      eventType: "appointment",
      title: "Oncology Follow-up",
      description: "Discussion of scan results and treatment plan adjustments",
      provider: "Dr. Michael Chen",
      location: "Metro Cancer Center"
    },
    {
      id: "event9",
      date: new Date("2024-02-01"),
      eventType: "treatment",
      title: "Started Immunotherapy",
      description: "Added pembrolizumab (Keytruda) to treatment regimen",
      provider: "Dr. Michael Chen",
      location: "Metro Cancer Center"
    }
  ];

  // Handle event click in the timeline
  const handleEventClick = (event: MedicalEvent) => {
    console.log("Event clicked:", event);
    // In a real app, you might show a modal with details or navigate to a detail page
  };

  // Open add treatment dialog
  const openAddTreatmentDialog = () => {
    setIsAddDialogOpen(true);
  };

  // Close add treatment dialog
  const closeAddTreatmentDialog = () => {
    setIsAddDialogOpen(false);
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Treatment Tracker</h1>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter Events
            </Button>
            <Button 
              className="bg-primary-800 hover:bg-primary-900"
              onClick={openAddTreatmentDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Treatment
            </Button>
          </div>
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
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={openAddTreatmentDialog}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Treatment
                    </Button>
                  </div>
                  {treatments.filter(t => t.active).map((treatment) => (
                    <div key={treatment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-base">{treatment.name}</h3>
                          <p className="text-sm text-gray-500">
                            {treatment.type} • Started {new Date(treatment.startDate!).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const dialog = document.createElement('dialog');
                            dialog.className = 'fixed inset-0 z-50 bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto mt-20';
                            
                            dialog.innerHTML = `
                              <div class="flex justify-between items-start mb-4">
                                <div>
                                  <h2 class="text-xl font-bold">${treatment.name}</h2>
                                  <p class="text-gray-500">${treatment.type}</p>
                                </div>
                                <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('dialog').close()">
                                  ✕
                                </button>
                              </div>
                              <div class="space-y-4">
                                <div>
                                  <h3 class="font-medium">Start Date</h3>
                                  <p>${new Date(treatment.startDate!).toLocaleDateString()}</p>
                                </div>
                                ${treatment.endDate ? `
                                  <div>
                                    <h3 class="font-medium">End Date</h3>
                                    <p>${new Date(treatment.endDate).toLocaleDateString()}</p>
                                  </div>
                                ` : ''}
                                ${treatment.notes ? `
                                  <div>
                                    <h3 class="font-medium">Notes</h3>
                                    <p class="whitespace-pre-wrap">${treatment.notes}</p>
                                  </div>
                                ` : ''}
                              </div>
                            `;

                            document.body.appendChild(dialog);
                            dialog.showModal();

                            dialog.addEventListener('close', () => {
                              dialog.remove();
                            });
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="mt-2"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/treatments/${treatment.id}`, {
                                method: 'DELETE'
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to delete treatment');
                              }
                              
                              // Refresh the treatments list using the correct query key
                              await queryClient.invalidateQueries({
                                queryKey: [['/api/treatments']]
                              });
                              
                              toast({
                                title: "Success",
                                description: "Treatment deleted successfully",
                              });
                            } catch (error) {
                              console.error('Failed to delete treatment:', error);
                              toast({
                                title: "Error",
                                description: "Failed to delete treatment",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Delete
                        </Button>
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
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={openAddTreatmentDialog}
                  >
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
        {/* Medical Timeline */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-800" />
              Medical Timeline
            </h2>
            <Button variant="outline" size="sm">Export Timeline</Button>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <MedicalTimeline events={sampleMedicalEvents} onEventClick={handleEventClick} />
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

      {/* Add Treatment Dialog */}
      <AddTreatmentDialog 
        isOpen={isAddDialogOpen}
        onClose={closeAddTreatmentDialog}
      />
    </div>
  );
}