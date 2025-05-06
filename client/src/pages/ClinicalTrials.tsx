import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SavedTrial } from "@shared/schema";
import { 
  Search, 
  MapPin, 
  Filter, 
  Clock, 
  BookmarkPlus,
  ExternalLink,
  CalendarClock,
  Activity,
  Beaker
} from "lucide-react";
import ClinicalTrialCard from "@/components/ClinicalTrialCard";

// Sample clinical trial data
const sampleTrials = [
  {
    id: "NCT04069273",
    title: "Pembrolizumab Plus Ramucirumab and Paclitaxel for Advanced Esophageal and Gastric Cancer",
    phase: "2",
    matchScore: 92,
    location: "Memorial Sloan Kettering Cancer Center",
    distance: 32,
    status: "Recruiting"
  },
  {
    id: "NCT04014075",
    title: "Trastuzumab Deruxtecan With Nivolumab in HER2 Expressing Esophagogastric Adenocarcinoma",
    phase: "1/2",
    matchScore: 78,
    location: "Dana-Farber Cancer Institute",
    distance: 45,
    status: "Recruiting"
  },
  {
    id: "NCT05356741",
    title: "Study of M7824 in Locally Advanced Esophageal Cancer",
    phase: "3",
    matchScore: 85,
    location: "Johns Hopkins Medical Center",
    distance: 62,
    status: "Recruiting"
  },
  {
    id: "NCT04161794",
    title: "Tislelizumab Plus Chemotherapy Versus Chemotherapy Alone in Recurrent or Metastatic Esophageal Squamous Cell Carcinoma",
    phase: "3",
    matchScore: 76,
    location: "MD Anderson Cancer Center",
    distance: 115,
    status: "Active, not recruiting"
  },
  {
    id: "NCT03543683",
    title: "Durvalumab, Tremelimumab, and Radiation Therapy in Treating Patients With Esophageal or Gastric Cancer",
    phase: "2",
    matchScore: 68,
    location: "Stanford Medical Center",
    distance: 212,
    status: "Recruiting"
  },
  {
    id: "NCT03604991",
    title: "Cabozantinib With Pembrolizumab in Treating Patients With Advanced Cancers of the Digestive System",
    phase: "2",
    matchScore: 62,
    location: "Mayo Clinic",
    distance: 187,
    status: "Recruiting"
  }
];

interface ClinicalTrialsProps {
  inTabView?: boolean;
}

export default function ClinicalTrials({ inTabView = false }: ClinicalTrialsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [distanceFilter, setDistanceFilter] = useState([200]);
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("recruiting");
  
  // Fetch saved trials from API
  const { data: savedTrials, isLoading, error } = useQuery<SavedTrial[]>({
    queryKey: ['/api/trials/saved'],
    // If API doesn't exist yet, return empty array
    queryFn: async () => {
      try {
        const response = await fetch('/api/trials/saved');
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error("Error fetching saved trials:", error);
        return [];
      }
    },
  });
  
  // Filter trials based on search query and filters
  const filteredTrials = sampleTrials.filter(trial => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      trial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trial.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Distance filter
    const matchesDistance = trial.distance <= distanceFilter[0];
    
    // Phase filter
    const matchesPhase = phaseFilter === "all" || trial.phase.includes(phaseFilter);
    
    // Status filter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "recruiting" && trial.status.toLowerCase() === "recruiting") ||
      (statusFilter === "active" && trial.status.toLowerCase().includes("active"));
    
    return matchesSearch && matchesDistance && matchesPhase && matchesStatus;
  });
  
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Clinical Trials</h1>
        </div>
        
        {/* Search and filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    className="pl-10"
                    placeholder="Search clinical trials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger>
                    <Beaker className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Trial Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="1">Phase 1</SelectItem>
                    <SelectItem value="2">Phase 2</SelectItem>
                    <SelectItem value="3">Phase 3</SelectItem>
                    <SelectItem value="4">Phase 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Activity className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="recruiting">Recruiting</SelectItem>
                    <SelectItem value="active">Active, Not Recruiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">Distance: {distanceFilter[0]} miles</span>
                </div>
                <div className="flex-1 px-2">
                  <Slider
                    value={distanceFilter}
                    onValueChange={setDistanceFilter}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Trial display */}
        <Tabs defaultValue="matches">
          <TabsList>
            <TabsTrigger value="matches">Matching Trials</TabsTrigger>
            <TabsTrigger value="saved">Saved Trials</TabsTrigger>
            <TabsTrigger value="timeline">Trial Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches" className="pt-4">
            {filteredTrials.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarClock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No matching clinical trials found</p>
                <p className="text-sm mt-2">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTrials.map((trial) => (
                  <ClinicalTrialCard
                    key={trial.id}
                    trial={trial}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="pt-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p>Loading saved trials...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>Error loading saved trials. Please try again.</p>
              </div>
            ) : !savedTrials || savedTrials.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookmarkPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No saved clinical trials</p>
                <p className="text-sm mt-2">Save trials from the Matching Trials tab to keep track of them.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedTrials.map((trial) => (
                  <Card key={trial.id} className="overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium">Phase {trial.phase}</span>
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                          {trial.matchScore}% Match
                        </Badge>
                      </div>
                      <span className="text-xs font-medium text-green-600">{trial.status}</span>
                    </div>
                    <CardContent className="p-4">
                      <h5 className="text-sm font-semibold mb-2">
                        {trial.title}
                      </h5>
                      <div className="mb-4">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-gray-500 mr-1.5" />
                          <span>{trial.trialId}</span>
                        </div>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex items-center">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="timeline" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trial Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200"></div>
                  
                  <div className="space-y-8 ml-10">
                    {/* Timeline items */}
                    <div className="relative">
                      <div className="absolute -left-10 mt-1 h-4 w-4 rounded-full bg-primary-800"></div>
                      <div>
                        <h3 className="font-medium">Screening Period</h3>
                        <p className="text-sm text-gray-500 mb-2">Feb 15 - Mar 1, 2024</p>
                        <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                          <p>Initial screening visit includes:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Physical examination</li>
                            <li>Blood tests and imaging</li>
                            <li>Eligibility confirmation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-10 mt-1 h-4 w-4 rounded-full bg-primary-800"></div>
                      <div>
                        <h3 className="font-medium">Treatment Initiation</h3>
                        <p className="text-sm text-gray-500 mb-2">Mar 15, 2024</p>
                        <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                          <p>First treatment cycle begins:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Immunotherapy administration</li>
                            <li>Baseline measurements</li>
                            <li>Initial side effect monitoring</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-10 mt-1 h-4 w-4 rounded-full bg-gray-300"></div>
                      <div>
                        <h3 className="font-medium">First Assessment</h3>
                        <p className="text-sm text-gray-500 mb-2">May 15, 2024</p>
                        <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                          <p>Comprehensive evaluation after 2 cycles:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>CT scan to measure tumor response</li>
                            <li>Blood work and biomarker analysis</li>
                            <li>Decision point for continuation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-10 mt-1 h-4 w-4 rounded-full bg-gray-300"></div>
                      <div>
                        <h3 className="font-medium">Follow-up Period</h3>
                        <p className="text-sm text-gray-500 mb-2">Nov 15, 2024 - May 15, 2025</p>
                        <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                          <p>Post-treatment monitoring:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Monthly check-ups</li>
                            <li>Quarterly imaging</li>
                            <li>Long-term outcomes tracking</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
