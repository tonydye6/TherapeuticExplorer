// client/src/pages/ClinicalTrials.tsx

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { NeoCard, NeoCardHeader, NeoCardContent, NeoCardTitle, NeoCardDescription, NeoCardFooter, NeoCardDecoration, NeoCardBadge } from "@/components/ui/neo-card";
import { Input } from "@/components/ui/input";
import { NeoButton } from "@/components/ui/neo-button";
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

        <NeoCard className="h-auto">
          <NeoCardDecoration />
          <NeoCardHeader>
            <NeoCardTitle>REFINE YOUR SEARCH</NeoCardTitle>
          </NeoCardHeader>
          <NeoCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-2 lg:col-span-2">
                <Label htmlFor="trialSearch" className="block text-sm font-bold text-sophera-text-heading mb-2">Search Trials</Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-sophera-text-subtle" size={20} />
                  <Input
                    id="trialSearch"
                    className="pl-11 h-12 border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card"
                    placeholder="Keywords, NCT ID, Condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phaseFilter" className="block text-sm font-bold text-sophera-text-heading mb-2">Phase</Label>
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger id="phaseFilter" className="h-12 border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
                    <Beaker className="h-5 w-5 mr-2 text-sophera-text-subtle" />
                    <SelectValue placeholder="Trial Phase" />
                  </SelectTrigger>
                  <SelectContent className="border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
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
                <Label htmlFor="statusFilter" className="block text-sm font-bold text-sophera-text-heading mb-2">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="statusFilter" className="h-12 border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
                    <Activity className="h-5 w-5 mr-2 text-sophera-text-subtle" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="recruiting">Recruiting</SelectItem>
                    <SelectItem value="active">Active, Not Recruiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-3 border-sophera-text-heading">
              <Label htmlFor="distanceSlider" className="block text-sm font-bold text-sophera-text-heading mb-2">Distance</Label>
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-sophera-text-subtle" />
                <Slider
                  id="distanceSlider"
                  value={distanceFilter}
                  onValueChange={setDistanceFilter}
                  max={500}
                  step={10}
                  className="w-full [&>span:first-child]:h-2 [&>span:first-child]:bg-sophera-brand-primary-light [&>span:first-child]:border-2 [&>span:first-child]:border-sophera-text-heading [&>span:first-child]:rounded-md [&>span:first-child>span]:bg-sophera-brand-primary"
                />
                <span className="text-sm font-bold text-sophera-text-heading w-24 text-right">{distanceFilter[0]} miles</span>
              </div>
            </div>
          </NeoCardContent>
        </NeoCard>

        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1.5 border-3 border-sophera-text-heading rounded-xl gap-1.5 bg-white mb-6">
            <TabsTrigger 
              value="matches" 
              className="text-base font-bold data-[state=active]:bg-sophera-brand-primary data-[state=active]:text-white rounded-lg h-11"
            >
              Matching Trials ({filteredTrials.length})
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="text-base font-bold data-[state=active]:bg-sophera-brand-primary data-[state=active]:text-white rounded-lg h-11"
            >
              Saved Trials ({savedTrials.length})
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="text-base font-bold data-[state=active]:bg-sophera-brand-primary data-[state=active]:text-white rounded-lg h-11"
            >
              Trial Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="pt-2">
            {filteredTrials.length === 0 ? (
              <NeoCard className="h-auto text-center py-16">
                <NeoCardContent>
                  <CalendarClock className="h-16 w-16 mx-auto mb-6 text-sophera-text-subtle" />
                  <h3 className="text-xl font-extrabold text-sophera-text-heading mb-4">NO MATCHING TRIALS FOUND</h3>
                  <p className="text-sophera-text-body max-w-md mx-auto">
                    Try adjusting your search terms or filters to discover relevant research opportunities.
                  </p>
                </NeoCardContent>
              </NeoCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTrials.map((trial) => (
                  <NeoCard key={trial.id} className="h-auto">
                    <NeoCardDecoration />
                    <NeoCardHeader>
                      <div className="flex justify-between items-start">
                        <NeoCardTitle>{trial.title}</NeoCardTitle>
                        <NeoCardBadge>Phase {trial.phase}</NeoCardBadge>
                      </div>
                    </NeoCardHeader>
                    <NeoCardContent>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className="bg-sophera-brand-primary-light text-sophera-brand-primary-dark border-2 border-sophera-text-heading rounded-lg">
                          {trial.status}
                        </Badge>
                        <Badge variant="outline" className="bg-white text-sophera-text-heading border-2 border-sophera-text-heading rounded-lg">
                          <MapPin className="h-3 w-3 mr-1" /> {trial.distance} miles
                        </Badge>
                        <Badge variant="outline" className="bg-white text-sophera-accent-secondary border-2 border-sophera-text-heading rounded-lg">
                          <Target className="h-3 w-3 mr-1" /> {trial.matchScore}% match
                        </Badge>
                      </div>

                      <p className="text-sophera-text-body mb-4">
                        {trial.description}
                      </p>

                      <div className="border-t-2 border-dashed border-sophera-text-heading pt-4">
                        <div className="flex gap-2 text-sm text-muted-foreground mb-2">
                          <span className="font-bold text-sophera-text-heading">Location:</span>
                          <span>{trial.location}</span>
                        </div>
                        {trial.conditions && trial.conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {trial.conditions.map(condition => (
                              <Badge key={condition} className="bg-sophera-accent-secondary/10 text-sophera-text-heading border-2 border-sophera-text-heading rounded-lg">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </NeoCardContent>
                    <NeoCardFooter>
                      <div className="flex items-center justify-between w-full">
                        <NeoButton
                          buttonText="Save trial"
                          size="sm"
                          color="primary"
                          icon={<BookmarkPlus className="h-4 w-4" />}
                        />
                        
                        <NeoButton
                          buttonText="Details"
                          size="sm"
                          color="cyan"
                          icon={<ExternalLink className="h-4 w-4" />}
                        />
                      </div>
                    </NeoCardFooter>
                  </NeoCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="pt-2">
            {isLoadingSaved ? (
              <div className="text-center py-12 text-sophera-text-body">
                <div className="animate-spin h-10 w-10 border-4 border-sophera-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-bold">Loading your saved trials...</p>
              </div>
            ) : errorSaved ? (
              <NeoCard className="h-auto text-center py-16">
                <NeoCardContent>
                  <Info className="h-16 w-16 mx-auto mb-6 text-red-500" />
                  <h3 className="text-xl font-extrabold text-red-600 mb-4">ERROR LOADING SAVED TRIALS</h3>
                  <p className="text-red-500 max-w-md mx-auto">
                    We couldn't retrieve your saved trials. Please try again later.
                  </p>
                </NeoCardContent>
              </NeoCard>
            ) : savedTrials.length === 0 ? (
              <NeoCard className="h-auto text-center py-16">
                <NeoCardContent>
                  <BookmarkPlus className="h-16 w-16 mx-auto mb-6 text-sophera-text-subtle" />
                  <h3 className="text-xl font-extrabold text-sophera-text-heading mb-4">NO SAVED CLINICAL TRIALS</h3>
                  <p className="text-sophera-text-body max-w-md mx-auto mb-6">
                    Tap the bookmark icon on any trial to save it here for easy access.
                  </p>
                </NeoCardContent>
              </NeoCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedTrials.map((trial) => (
                  <NeoCard key={trial.trialId} className="h-auto">
                    <NeoCardDecoration />
                    <NeoCardHeader>
                      <div className="flex justify-between items-start">
                        <NeoCardTitle>{trial.title}</NeoCardTitle>
                        <NeoCardBadge>Phase {trial.phase}</NeoCardBadge>
                      </div>
                    </NeoCardHeader>
                    <NeoCardContent>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className="bg-sophera-brand-primary-light text-sophera-brand-primary-dark border-2 border-sophera-text-heading rounded-lg">
                          {trial.status}
                        </Badge>
                        <Badge variant="outline" className="bg-white text-sophera-text-heading border-2 border-sophera-text-heading rounded-lg">
                          <MapPin className="h-3 w-3 mr-1" /> {trial.distance} miles
                        </Badge>
                      </div>

                      <div className="bg-sophera-brand-primary/5 border-2 border-dashed border-sophera-text-heading rounded-lg p-3 mb-4">
                        <h4 className="font-bold text-sm text-sophera-text-heading mb-1">YOUR NOTES:</h4>
                        <p className="text-sm">{trial.notes}</p>
                      </div>

                      <div className="border-t-2 border-dashed border-sophera-text-heading pt-4">
                        <div className="flex gap-2 text-sm text-muted-foreground mb-2">
                          <span className="font-bold text-sophera-text-heading">Location:</span>
                          <span>{trial.location}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="font-bold text-sophera-text-heading">Saved on:</span>
                          <span className="ml-2">{new Date(trial.savedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </NeoCardContent>
                    <NeoCardFooter>
                      <div className="flex items-center justify-between w-full">
                        <NeoButton
                          buttonText="Remove"
                          size="sm"
                          color="red"
                        />
                        
                        <NeoButton
                          buttonText="View trial"
                          size="sm"
                          color="primary"
                          icon={<ExternalLink className="h-4 w-4" />}
                        />
                      </div>
                    </NeoCardFooter>
                  </NeoCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="pt-2">
            <NeoCard className="h-auto">
              <NeoCardHeader>
                <div className="flex justify-between items-center">
                  <NeoCardTitle>UNDERSTANDING TRIAL TIMELINE</NeoCardTitle>
                  <NeoCardDescription>
                    This is a general example. Actual timelines vary greatly per trial.
                  </NeoCardDescription>
                </div>
              </NeoCardHeader>
              <NeoCardContent>
                <div className="relative pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-1 bg-sophera-text-heading rounded-full"></div>

                  <div className="space-y-10">
                    {[
                      { icon: <Search className="h-5 w-5 text-sophera-accent-secondary"/>, title: "Screening & Enrollment", duration: "1-4 Weeks", details: ["Initial eligibility checks", "Medical history review", "Informed consent process", "Baseline tests & scans"] },
                      { icon: <Beaker className="h-5 w-5 text-sophera-brand-primary"/>, title: "Treatment Phase", duration: "Weeks to Months (Varies)", details: ["Receiving study drug/intervention", "Regular monitoring visits", "Lab tests & scans", "Side effect tracking"] },
                      { icon: <Activity className="h-5 w-5 text-sophera-accent-tertiary"/>, title: "Follow-Up Phase", duration: "Months to Years", details: ["Periodic check-ins", "Monitoring for long-term outcomes", "Quality of life assessments", "Survival tracking (if applicable)"] },
                      { icon: <ListChecks className="h-5 w-5 text-sophera-accent-primary"/>, title: "Study Completion", duration: "After Follow-up Period", details: ["Final assessments", "Long-term follow-up plan", "Option to join extension studies (sometimes)", "Access to study results (when available)"] },
                    ].map((phase, idx) => (
                      <div key={idx} className="relative pl-10">
                        <div className="absolute left-[-15px] top-1 h-6 w-6 rounded-full bg-white border-3 border-sophera-text-heading flex items-center justify-center shadow-[0.1rem_0.1rem_0_#05060f]">
                          {phase.icon}
                        </div>
                        <div className="bg-white rounded-lg border-3 border-sophera-text-heading p-4 shadow-[0.3rem_0.3rem_0_#05060f]">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-extrabold text-lg text-sophera-text-heading">{phase.title}</h3>
                            <Badge className="ml-2 bg-white text-sophera-text-heading border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_#05060f] font-bold">
                              {phase.duration}
                            </Badge>
                          </div>
                          <ul className="space-y-1">
                            {phase.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-sophera-brand-primary flex-shrink-0" />
                                <span className="text-sophera-text-body">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </NeoCardContent>
            </NeoCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}