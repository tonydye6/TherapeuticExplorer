import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TreatmentCompanion from '@/components/TreatmentCompanion';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Clock, AlertTriangle, Edit, Pill, User } from 'lucide-react';

const TreatmentCompanionPage = () => {
  const [selectedTreatment, setSelectedTreatment] = useState<string>("");
  
  // Fetch user treatments
  const { data: treatments, isLoading: isLoadingTreatments } = useQuery({
    queryKey: ['/api/treatments'],
    queryFn: async () => {
      const response = await fetch('/api/treatments');
      if (!response.ok) throw new Error('Failed to fetch treatments');
      return response.json();
    }
  });
  
  // Set the first active treatment as default when data loads
  useEffect(() => {
    if (treatments && treatments.length > 0) {
      const activeTreatments = treatments.filter((t: any) => t.active);
      if (activeTreatments.length > 0) {
        setSelectedTreatment(activeTreatments[0].name);
      } else if (treatments.length > 0) {
        setSelectedTreatment(treatments[0].name);
      }
    }
  }, [treatments]);
  
  // Mock data for the profile section (in a real app, you'd fetch this from an API)
  const patientProfile = {
    name: "Matt Culligan",
    diagnosis: "Esophageal Adenocarcinoma",
    diagnosisDate: "2023-08-15",
    stage: "Stage II",
    upcomingAppointments: [
      {
        id: 1,
        type: "Oncology Follow-up",
        date: "2025-05-10",
        doctor: "Dr. Sarah Chen"
      },
      {
        id: 2,
        type: "Nutrition Consultation",
        date: "2025-05-15",
        doctor: "Emma Roberts, RD"
      }
    ],
    recentSymptoms: [
      { id: 1, name: "Fatigue", severity: "moderate", date: "2025-04-16" },
      { id: 2, name: "Nausea", severity: "mild", date: "2025-04-15" }
    ]
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Treatment Companion</h1>
      <p className="text-gray-600 mb-6">
        Your personal support assistant for managing your cancer treatment journey.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar: Patient profile and widgets */}
        <div className="space-y-6">
          {/* Patient profile card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Patient Profile</CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">{patientProfile.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{patientProfile.diagnosis}</span>
                    <Badge variant="outline" className="text-xs">
                      {patientProfile.stage}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Treatment selector */}
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Current Treatment
                  </label>
                  <Select
                    value={selectedTreatment}
                    onValueChange={setSelectedTreatment}
                    disabled={isLoadingTreatments}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingTreatments ? "Loading..." : "Select a treatment"} />
                    </SelectTrigger>
                    <SelectContent>
                      {treatments && treatments.map((treatment: any) => (
                        <SelectItem key={treatment.id} value={treatment.name}>
                          <div className="flex items-center gap-2">
                            <span>{treatment.name}</span>
                            {treatment.active && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                      {(!treatments || treatments.length === 0) && (
                        <SelectItem value="none" disabled>
                          No treatments available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Recent symptoms */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Recent Symptoms
                  </h3>
                  <ul className="space-y-2">
                    {patientProfile.recentSymptoms.map(symptom => (
                      <li key={symptom.id} className="flex justify-between items-center text-sm">
                        <span>{symptom.name}</span>
                        <Badge 
                          className={`text-xs ${
                            symptom.severity === 'severe' ? 'bg-red-100 text-red-800' :
                            symptom.severity === 'moderate' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          {symptom.severity}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" className="mt-2 w-full text-xs">
                    Log New Symptom
                  </Button>
                </div>
                
                {/* Upcoming appointments */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Upcoming Appointments
                  </h3>
                  <ul className="space-y-2">
                    {patientProfile.upcomingAppointments.map(appointment => (
                      <li key={appointment.id} className="text-sm border-l-2 border-blue-200 pl-3 py-1">
                        <div className="font-medium">{appointment.type}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.doctor}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" className="mt-2 w-full text-xs">
                    View All Appointments
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Resources card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Support Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-primary hover:underline flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Esophageal Cancer Support Group
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Medication Management Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Side Effect Management Tips
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side: Chat interface */}
        <div className="lg:col-span-2">
          <TreatmentCompanion 
            currentTreatment={selectedTreatment}
            className="h-[700px]"
          />
        </div>
      </div>
    </div>
  );
};

export default TreatmentCompanionPage;