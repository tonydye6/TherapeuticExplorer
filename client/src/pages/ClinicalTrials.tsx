// client/src/pages/ClinicalTrials.tsx

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SavedTrial, ClinicalTrial as ClinicalTrialShared } from "@shared/schema";
import {
  Search,
  MapPin,
  Filter,
  Clock,
  BookmarkPlus,
  ExternalLink,
  CalendarClock,
  Activity,
  Beaker,
  ListChecks,
  Target,
  Users,
  Info,
  ChevronRight
} from "lucide-react";
import ClinicalTrialCard from "@/components/ClinicalTrialCard";

const sampleTrials: ClinicalTrialShared[] = [
  { id: "NCT04069273", title: "Pembrolizumab Plus Ramucirumab and Paclitaxel for Advanced Esophageal and Gastric Cancer", phase: "2", matchScore: 92, location: "Memorial Sloan Kettering Cancer Center", distance: 32, status: "Recruiting", description: "This study evaluates the efficacy and safety of combining pembrolizumab, ramucirumab, and paclitaxel in patients with advanced esophageal or gastric cancer.", interventions: ["Pembrolizumab", "Ramucirumab"], conditions: ["Esophageal Cancer", "Gastric Cancer"] },
  { id: "NCT04014075", title: "Trastuzumab Deruxtecan With Nivolumab in HER2 Expressing Esophagogastric Adenocarcinoma", phase: "1/2", matchScore: 78, location: "Dana-Farber Cancer Institute", distance: 45, status: "Recruiting", description: "Investigating the combination of trastuzumab deruxtecan and nivolumab for HER2-expressing esophagogastric adenocarcinoma.", interventions: ["Trastuzumab Deruxtecan"], conditions: ["HER2+ Esophageal Cancer"] },
  { id: "NCT05356741", title: "Study of M7824 in Locally Advanced Esophageal Cancer", phase: "3", matchScore: 85, location: "Johns Hopkins Medical Center", distance: 62, status: "Recruiting", description: "A phase 3 study assessing M7824 (bintrafusp alfa) compared to standard chemoradiation in locally advanced esophageal cancer.", interventions: ["M7824"], conditions: ["Esophageal Cancer"] },
  { id: "NCT04161794", title: "Tislelizumab Plus Chemotherapy Versus Chemotherapy Alone in Recurrent or Metastatic Esophageal Squamous Cell Carcinoma", phase: "3", matchScore: 76, location: "MD Anderson Cancer Center", distance: 115, status: "Active, not recruiting", description: "Comparing tislelizumab plus chemotherapy against chemotherapy alone for recurrent or metastatic esophageal squamous cell carcinoma.", interventions: ["Tislelizumab"], conditions: ["Esophageal Squamous Cell Carcinoma"] },
  { id: "NCT03543683", title: "Durvalumab, Tremelimumab, and Radiation Therapy in Treating Patients With Esophageal or Gastric Cancer", phase: "2", matchScore: 68, location: "Stanford Medical Center", distance: 212, status: "Recruiting", description: "Evaluating the combination of durvalumab, tremelimumab, and radiation therapy in esophageal or gastric cancer patients.", interventions: ["Durvalumab"], conditions: ["Esophageal Cancer", "Gastric Cancer"] },
  { id: "NCT03604991", title: "Cabozantinib With Pembrolizumab in Treating Patients With Advanced Cancers of the Digestive System", phase: "2", matchScore: 62, location: "Mayo Clinic", distance: 187, status: "Recruiting", description: "A study of cabozantinib with pembrolizumab for various advanced cancers of the digestive system, including esophageal.", interventions: ["Cabozantinib"], conditions: ["Esophageal Cancer", "Digestive System Cancers"] }
];

interface ClinicalTrialsProps {
  inTabView?: boolean;
}

export default function ClinicalTrialsPage({ inTabView = false }: ClinicalTrialsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [distanceFilter, setDistanceFilter] = useState([250]);
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("recruiting");

  const { data: savedTrialsData, isLoading: isLoadingSaved, error: errorSaved } = useQuery<SavedTrial[]>({
    queryKey: ['/api/trials/saved'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const savedTrialIds = ["NCT04069273", "NCT05356741"];
      return sampleTrials.filter(t => savedTrialIds.includes(t.id)).map(st => ({
        ...st,
        userId: "mockUserId",
        trialId: st.id,
        notes: "This trial looks promising, discussed with Dr. Smith.",
        savedDate: new Date().toISOString()
      })) as SavedTrial[];
    },
  });

  const savedTrials = savedTrialsData || [];

  const filteredTrials = sampleTrials.filter(trial => {
    const matchesSearch = searchQuery === "" ||
      trial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trial.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trial.conditions && trial.conditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (trial.interventions && trial.interventions.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesDistance = trial.distance <= distanceFilter[0];
    const matchesPhase = phaseFilter === "all" || (trial.phase && trial.phase.replace('/', '').includes(phaseFilter.replace('/', '')));
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "recruiting" && trial.status.toLowerCase() === "recruiting") ||
      (statusFilter === "active" && trial.status.toLowerCase().includes("active") && !trial.status.toLowerCase().includes("recruiting"));

    return matchesSearch && matchesDistance && matchesPhase && matchesStatus;
  });

  return (
    <div className={`container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${inTabView ? 'pt-0' : 'py-8 md:py-12'}`}>
      <div className="flex flex-col gap-8">
        {!inTabView && (
          <div className="text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading mb-2">
              Find Clinical Trials
            </h1>
            <p className="text-lg text-sophera-text-body">
              Explore ongoing research studies that might be relevant for you.
            </p>
          </div>
        )}

        <Card className="bg-sophera-bg-card border border-sophera-border-primary rounded-sophera-card shadow-lg">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-xl font-semibold text-sophera-text-heading flex items-center">
              <Filter className="h-5 w-5 mr-2.5 text-sophera-brand-primary" />
              Refine Your Search
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2 lg:col-span-2">
                <Label htmlFor="trialSearch" className="block text-sm font-medium text-sophera-text-body mb-1.5">Search Trials</Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-sophera-text-subtle" size={20} />
                  <Input
                    id="trialSearch"
                    className="pl-11 h-12 rounded-sophera-input text-base"
                    placeholder="Keywords, NCT ID, Condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phaseFilter" className="block text-sm font-medium text-sophera-text-body mb-1.5">Phase</Label>
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger id="phaseFilter" className="h-12 rounded-sophera-input text-base">
                    <Beaker className="h-5 w-5 mr-2 text-sophera-text-subtle" />
                    <SelectValue placeholder="Trial Phase" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sophera-input">
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="1">Phase 1</SelectItem>
                    <SelectItem value="1/2">Phase 1/2</SelectItem>
                    <SelectItem value="2">Phase 2</SelectItem>
                    <SelectItem value="2/3">Phase 2/3</SelectItem>
                    <SelectItem value="3">Phase 3</SelectItem>
                    <SelectItem value="4">Phase 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="statusFilter" className="block text-sm font-medium text-sophera-text-body mb-1.5">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="statusFilter" className="h-12 rounded-sophera-input text-base">
                    <Activity className="h-5 w-5 mr-2 text-sophera-text-subtle" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sophera-input">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="recruiting">Recruiting</SelectItem>
                    <SelectItem value="active">Active, Not Recruiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-sophera-border-primary/50">
              <Label htmlFor="distanceSlider" className="block text-sm font-medium text-sophera-text-body mb-2">Distance</Label>
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-sophera-text-subtle" />
                <Slider
                  id="distanceSlider"
                  value={distanceFilter}
                  onValueChange={setDistanceFilter}
                  max={500}
                  step={10}
                  className="w-full [&>span:first-child]:h-2 [&>span:first-child>span]:bg-sophera-brand-primary"
                />
                <span className="text-sm font-medium text-sophera-text-body w-24 text-right">{distanceFilter[0]} miles</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1.5 bg-sophera-gradient-start rounded-sophera-button mb-6">
            <TabsTrigger value="matches" className="text-base data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11">Matching Trials ({filteredTrials.length})</TabsTrigger>
            <TabsTrigger value="saved" className="text-base data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11">Saved Trials ({savedTrials.length})</TabsTrigger>
            <TabsTrigger value="timeline" className="text-base data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11">Trial Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="pt-2">
            {filteredTrials.length === 0 ? (
              <Card className="text-center py-16 md:py-24 bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card shadow-lg">
                <CalendarClock className="h-16 w-16 mx-auto mb-6 text-sophera-text-subtle/70" />
                <p className="text-xl font-semibold text-sophera-text-heading">No Matching Clinical Trials Found</p>
                <p className="text-sophera-text-body mt-2 max-w-md mx-auto">Try adjusting your search terms or filters to discover relevant research opportunities.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTrials.map((trial) => (
                  <ClinicalTrialCard key={trial.id} trial={trial} isSaved={savedTrials.some(st => st.trialId === trial.id)} onToggleSave={() => {}} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="pt-2">
            {isLoadingSaved ? (
              <div className="text-center py-12 text-sophera-text-body">Loading your saved trials...</div>
            ) : errorSaved ? (
              <Card className="text-center py-16 md:py-24 bg-red-50 border-red-200 rounded-sophera-card shadow-lg">
                <Info className="h-16 w-16 mx-auto mb-6 text-red-500" />
                <p className="text-xl font-semibold text-red-700">Error Loading Saved Trials</p>
                <p className="text-red-600 mt-2 max-w-md mx-auto">We couldn't retrieve your saved trials. Please try again later.</p>
              </Card>
            ) : savedTrials.length === 0 ? (
              <Card className="text-center py-16 md:py-24 bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card shadow-lg">
                <BookmarkPlus className="h-16 w-16 mx-auto mb-6 text-sophera-text-subtle/70" />
                <p className="text-xl font-semibold text-sophera-text-heading">No Saved Clinical Trials</p>
                <p className="text-sophera-text-body mt-2 max-w-md mx-auto">Tap the bookmark icon on any trial to save it here for easy access.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedTrials.map((trial) => (
                  <ClinicalTrialCard key={trial.trialId} trial={{...trial, id: trial.trialId, title: trial.title || "N/A", phase: trial.phase || "N/A", status: trial.status || "N/A", location: trial.location || "N/A", distance: trial.distance || 0, matchScore: trial.matchScore || 0, description: trial.notes || "", interventions: [], conditions:[] }} isSaved={true} onToggleSave={() => {}} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="pt-2">
            <Card className="bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card shadow-lg">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-xl font-semibold text-sophera-text-heading flex items-center">
                  <CalendarClock className="h-5 w-5 mr-2.5 text-sophera-brand-primary" />
                  Understanding a Typical Trial Timeline
                </CardTitle>
                <CardDescription className="text-sophera-text-subtle pt-1">
                  This is a general example. Actual timelines vary greatly per trial.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-sophera-border-primary rounded-full"></div>

                  <div className="space-y-10">
                    {[
                      { icon: <Search className="h-5 w-5 text-sophera-accent-secondary"/>, title: "Screening & Enrollment", duration: "1-4 Weeks", details: ["Initial eligibility checks", "Medical history review", "Informed consent process", "Baseline tests & scans"] },
                      { icon: <Beaker className="h-5 w-5 text-sophera-brand-primary"/>, title: "Treatment Phase", duration: "Weeks to Months (Varies)", details: ["Receiving study drug/intervention", "Regular monitoring visits", "Side effect management", "Adherence tracking"] },
                      { icon: <ListChecks className="h-5 w-5 text-sophera-accent-tertiary"/>, title: "Assessment & Evaluation", duration: "Ongoing / Periodic", details: ["Tumor response assessments (scans)", "Blood tests & biomarker analysis", "Quality of life questionnaires", "Efficacy and safety evaluations"] },
                      { icon: <Target className="h-5 w-5 text-green-500"/>, title: "Follow-up Period", duration: "Months to Years (Varies)", details: ["Long-term monitoring after treatment", "Tracking overall survival", "Late side effect assessment", "Data collection for final analysis"] },
                    ].map((item, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[22px] top-1 h-4 w-4 rounded-full bg-sophera-bg-card border-2 border-sophera-brand-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-sophera-brand-primary"></div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {item.icon}
                            <h3 className="text-md font-semibold text-sophera-text-heading">{item.title}</h3>
                          </div>
                          <p className="text-xs text-sophera-text-subtle mb-2.5">{item.duration}</p>
                          <div className="bg-sophera-gradient-start p-4 rounded-sophera-input border border-sophera-border-primary/30 text-sm">
                            <ul className="list-disc pl-5 space-y-1.5 text-sophera-text-body">
                              {item.details.map(detail => <li key={detail}>{detail}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
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