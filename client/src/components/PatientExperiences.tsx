import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlternativeTreatment } from '@shared/schema';
import { 
  Users, MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle, 
  FileQuestion, Lightbulb, Clock, BarChart, Share, PlusCircle,
  HeartPulse, Pill, Info
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PatientExperiencesProps {
  treatment: AlternativeTreatment;
}

export default function PatientExperiences({ treatment }: PatientExperiencesProps) {
  // Sample patient experiences
  const patientExperiences = [
    {
      id: 1,
      patientName: "Michael D.",
      age: 58,
      cancerType: "Esophageal Cancer, Stage 3",
      treatmentPeriod: "6 months",
      conventionalTreatments: ["Chemotherapy", "Radiation"],
      experience: "I incorporated this as part of my integrative approach alongside my standard treatments. While I can't be certain it directly impacted my cancer, I did notice improvements in my energy levels and fewer digestive issues during treatment.",
      positives: ["Reduced nausea", "Better energy", "Improved sleep"],
      negatives: ["Difficult to maintain consistently", "Expensive"],
      wouldRecommend: true,
      verified: true
    },
    {
      id: 2,
      patientName: "Lisa T.",
      age: 64,
      cancerType: "Esophageal Cancer, Stage 2",
      treatmentPeriod: "4 months",
      conventionalTreatments: ["Surgery", "Chemotherapy"],
      experience: "My oncologist was supportive of me trying this approach alongside standard treatment. I found it helped with my appetite issues and overall well-being during chemo. I was careful to time it properly to avoid any potential interactions.",
      positives: ["Better appetite", "Reduced anxiety", "Fewer digestive issues"],
      negatives: ["Taste was challenging", "Required careful planning with conventional treatments"],
      wouldRecommend: true,
      verified: true
    },
    {
      id: 3,
      patientName: "Robert K.",
      age: 52,
      cancerType: "Esophageal Cancer, Stage 4",
      treatmentPeriod: "8 months",
      conventionalTreatments: ["Immunotherapy", "Chemotherapy"],
      experience: "I tried this approach after researching complementary options for my cancer treatment. While I didn't experience any significant negative effects, I also can't report any substantial benefits. My main challenge was consistency with the protocol.",
      positives: ["Easy to incorporate", "No harmful side effects"],
      negatives: ["Limited noticeable benefits", "Difficult to source quality products"],
      wouldRecommend: false,
      verified: true
    }
  ];

  // Toggle for different view modes
  const [showDetailedView, setShowDetailedView] = React.useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Patient Experience Reports
            </CardTitle>
            <Badge variant="secondary" className="flex items-center">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Anecdotal Evidence
            </Badge>
          </div>
          <CardDescription>
            Personal experiences from patients who have used {treatment.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Important Disclaimer</h4>
                <p className="text-xs text-amber-700 mt-1">
                  These reports represent individual patient experiences and are not clinical evidence. 
                  Patient experiences vary widely and cannot predict your personal results. They should 
                  not be used as a substitute for professional medical advice or to make treatment decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Experience Reports Section */}
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium">Experience Reports ({patientExperiences.length})</h3>
              <div className="flex items-center space-x-1">
                <Button 
                  variant={showDetailedView ? "outline" : "default"} 
                  size="sm"
                  onClick={() => setShowDetailedView(false)}
                  className="h-7 px-2 text-xs"
                >
                  Summary View
                </Button>
                <Button 
                  variant={!showDetailedView ? "outline" : "default"} 
                  size="sm"
                  onClick={() => setShowDetailedView(true)}
                  className="h-7 px-2 text-xs"
                >
                  Detailed View
                </Button>
              </div>
            </div>

            {/* Detailed Experience Reports */}
            {showDetailedView ? (
              <Accordion type="single" collapsible className="w-full">
                {patientExperiences.map((experience) => (
                  <AccordionItem key={experience.id} value={`item-${experience.id}`}>
                    <AccordionTrigger>
                      <div className="flex items-center text-left">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium">{experience.patientName}</span>
                            {experience.verified && (
                              <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {experience.cancerType} | Used for {experience.treatmentPeriod}
                          </p>
                        </div>
                        <div className="flex items-center mr-4">
                          {experience.wouldRecommend ? (
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2 pb-1">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Experience:</h4>
                          <p className="text-sm">{experience.experience}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1 text-green-500" /> 
                              Reported Benefits:
                            </h4>
                            <ul className="list-disc ml-5 text-sm space-y-1">
                              {experience.positives.map((positive, idx) => (
                                <li key={idx}>{positive}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center">
                              <ThumbsDown className="h-3 w-3 mr-1 text-red-500" /> 
                              Reported Challenges:
                            </h4>
                            <ul className="list-disc ml-5 text-sm space-y-1">
                              {experience.negatives.map((negative, idx) => (
                                <li key={idx}>{negative}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1 flex items-center">
                            <Pill className="h-3 w-3 mr-1 text-blue-500" /> 
                            Used Alongside:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {experience.conventionalTreatments.map((tx, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tx}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
                          <span>Report ID: {experience.id}</span>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <MessageSquare className="h-3 w-3 mr-1" /> 
                              Ask Questions
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <Share className="h-3 w-3 mr-1" /> 
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              // Summary View
              <div className="space-y-4">
                {patientExperiences.map((experience) => (
                  <Card key={experience.id} className="border border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium">{experience.patientName}</h4>
                            {experience.verified && (
                              <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {experience.cancerType} | {experience.treatmentPeriod}
                          </p>
                        </div>
                        <Badge 
                          variant={experience.wouldRecommend ? "default" : "destructive"} 
                          className="text-xs"
                        >
                          {experience.wouldRecommend ? "Recommends" : "Doesn't Recommend"}
                        </Badge>
                      </div>
                      <Separator className="my-3" />
                      <p className="text-sm line-clamp-2">{experience.experience}</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-7 px-0 text-xs"
                        onClick={() => setShowDetailedView(true)}
                      >
                        Read Full Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Share Your Experience
              </Button>
            </div>

            <Separator className="my-2" />

            {/* Experience Summary */}
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Collective Experience Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-muted">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <HeartPulse className="h-8 w-8 text-pink-500 mb-2" />
                    <h4 className="text-sm font-medium">Most Reported Benefits</h4>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>Improved energy levels</li>
                      <li>Reduced digestive issues</li>
                      <li>Better appetite</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                    <h4 className="text-sm font-medium">Common Challenges</h4>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>Consistency difficulties</li>
                      <li>Cost concerns</li>
                      <li>Sourcing quality products</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Lightbulb className="h-8 w-8 text-yellow-500 mb-2" />
                    <h4 className="text-sm font-medium">Patient Insights</h4>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>Consult with oncologist first</li>
                      <li>Timing around treatments matters</li>
                      <li>Results vary significantly</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md mt-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium">Clinical Evidence vs. Patient Experiences</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Patient experiences provide valuable perspectives but differ fundamentally from clinical evidence. 
                    While these reports may offer insights into potential benefits and challenges, they should be 
                    considered alongside scientific research when making treatment decisions. Always discuss with your 
                    healthcare provider before incorporating any complementary approach.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}