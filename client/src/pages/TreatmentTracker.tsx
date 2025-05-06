import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import MedicalTimeline, { MedicalEvent, MedicalEventType } from "@/components/MedicalTimeline";
import AddTreatmentDialog from "@/components/AddTreatmentDialog";
import TreatmentCard from "@/components/TreatmentCard";
import { useTreatments } from "@/hooks/use-treatments";
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
  Clock,
  History
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

interface TreatmentTrackerProps {
  inTabView?: boolean;
}

export default function TreatmentTracker({ inTabView = false }: TreatmentTrackerProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("current");

  // Use our custom hook for treatments
  const {
    treatments,
    activeTreatments,
    inactiveTreatments,
    isLoading,
    error,
    addTreatment,
    updateTreatment,
    toggleActive,
    deleteTreatment,
    addSideEffect,
    addEffectiveness,
    isAddingSideEffect,
    isAddingEffectiveness
  } = useTreatments();

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
  
  // Open edit treatment dialog
  const handleEditTreatment = (treatmentId: number) => {
    setSelectedTreatmentId(treatmentId);
    // In a real app, you would open an edit dialog here
    toast({
      title: "Edit Treatment",
      description: `Edit functionality would open for treatment ${treatmentId}`,
    });
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

        {/* Treatments Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="current" className="flex items-center">
              <Pill className="h-4 w-4 mr-2" />
              Current Treatments
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Past Treatments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-4">
            {isLoading ? (
              <div className="p-8 text-center">
                <p>Loading treatments...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">Error loading treatments</p>
              </div>
            ) : activeTreatments.length === 0 ? (
              <div className="text-center p-8 border rounded-lg">
                <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No active treatments found</p>
                <Button 
                  variant="outline" 
                  onClick={openAddTreatmentDialog}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Treatment
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTreatments.map((treatment) => (
                  <TreatmentCard 
                    key={treatment.id}
                    treatment={treatment}
                    onEdit={handleEditTreatment}
                    onDelete={deleteTreatment}
                    onToggleActive={toggleActive}
                    onAddSideEffect={addSideEffect}
                    onAddEffectiveness={addEffectiveness}
                    isSubmittingSideEffect={isAddingSideEffect}
                    isSubmittingEffectiveness={isAddingEffectiveness}
                  />
                ))}
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 border-gray-300 h-full min-h-[220px]">
                  <Button 
                    variant="ghost" 
                    className="flex flex-col h-auto py-6" 
                    onClick={openAddTreatmentDialog}
                  >
                    <PlusCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Add Treatment</span>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {isLoading ? (
              <div className="p-8 text-center">
                <p>Loading treatments...</p>
              </div>
            ) : inactiveTreatments.length === 0 ? (
              <div className="text-center p-8 border rounded-lg">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No past treatments found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inactiveTreatments.map((treatment) => (
                  <TreatmentCard 
                    key={treatment.id}
                    treatment={treatment}
                    onEdit={handleEditTreatment}
                    onDelete={deleteTreatment}
                    onToggleActive={toggleActive}
                    onAddSideEffect={addSideEffect}
                    onAddEffectiveness={addEffectiveness}
                    isSubmittingSideEffect={isAddingSideEffect}
                    isSubmittingEffectiveness={isAddingEffectiveness}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-2" />

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