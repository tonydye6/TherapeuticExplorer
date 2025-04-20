import { useState } from "react";
import { AlternativeTreatment } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from "lucide-react";

interface CompatibilityCheckerProps {
  treatment: AlternativeTreatment;
}

// Types for conventional treatments
interface ConventionalTreatment {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Interaction {
  treatment: string;
  effect: string;
  severity: string;
}

export default function CompatibilityChecker({ treatment }: CompatibilityCheckerProps) {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [showInteractions, setShowInteractions] = useState(false);

  // Sample conventional treatments database
  const conventionalTreatments: ConventionalTreatment[] = [
    { 
      id: "chemo-5fu", 
      name: "5-Fluorouracil (5-FU)", 
      category: "Chemotherapy",
      description: "A commonly used chemotherapy drug for esophageal cancer."
    },
    { 
      id: "chemo-cisplatin", 
      name: "Cisplatin", 
      category: "Chemotherapy",
      description: "A platinum-based chemotherapy drug often used for esophageal cancer."
    },
    { 
      id: "chemo-taxol", 
      name: "Paclitaxel (Taxol)", 
      category: "Chemotherapy",
      description: "A chemotherapy medication used to treat several types of cancer."
    },
    { 
      id: "radiation", 
      name: "Radiation Therapy", 
      category: "Radiotherapy",
      description: "Uses high-energy particles to kill cancer cells."
    },
    { 
      id: "surgery", 
      name: "Esophagectomy", 
      category: "Surgery",
      description: "Surgical removal of part of the esophagus affected by cancer."
    },
    { 
      id: "immuno-keytruda", 
      name: "Pembrolizumab (Keytruda)", 
      category: "Immunotherapy",
      description: "An immunotherapy drug that helps the immune system detect and fight cancer cells."
    },
    { 
      id: "targeted-herceptin", 
      name: "Trastuzumab (Herceptin)", 
      category: "Targeted Therapy",
      description: "A targeted therapy for esophageal cancers that overexpress HER2."
    },
    { 
      id: "blood-warfarin", 
      name: "Warfarin", 
      category: "Blood Thinner",
      description: "An anticoagulant that may be prescribed to prevent blood clots."
    },
    { 
      id: "pain-opioid", 
      name: "Opioid Pain Medications", 
      category: "Pain Management",
      description: "Strong pain relievers that may be prescribed after surgery or for cancer pain."
    }
  ];

  // Group treatments by category
  const groupedTreatments = conventionalTreatments.reduce<Record<string, ConventionalTreatment[]>>(
    (groups, treatment) => {
      const category = treatment.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(treatment);
      return groups;
    },
    {}
  );

  // Parse interactions from treatment data
  const getInteractions = (): Interaction[] => {
    if (!treatment.interactions) {
      return [];
    }
    
    try {
      if (typeof treatment.interactions === 'string') {
        return JSON.parse(treatment.interactions);
      }
      return treatment.interactions as unknown as Interaction[];
    } catch (error) {
      console.error("Error parsing interactions:", error);
      return [];
    }
  };

  // Find interactions between selected conventional treatments and alternative treatment
  const findInteractions = () => {
    const interactions = getInteractions();
    const relevantInteractions: {
      conventionalTreatment: ConventionalTreatment;
      interaction: Interaction;
    }[] = [];

    selectedTreatments.forEach(selectedId => {
      const conventionalTreatment = conventionalTreatments.find(t => t.id === selectedId);
      if (!conventionalTreatment) return;

      interactions.forEach(interaction => {
        // Check if the interaction is relevant to the selected treatment
        // This is a simple check that could be improved with more sophisticated matching
        if (
          conventionalTreatment.name.toLowerCase().includes(interaction.treatment.toLowerCase()) ||
          conventionalTreatment.category.toLowerCase().includes(interaction.treatment.toLowerCase()) ||
          interaction.treatment.toLowerCase().includes(conventionalTreatment.name.toLowerCase()) ||
          interaction.treatment.toLowerCase().includes(conventionalTreatment.category.toLowerCase())
        ) {
          relevantInteractions.push({
            conventionalTreatment,
            interaction
          });
        }
      });
    });

    return relevantInteractions;
  };

  const handleTreatmentToggle = (treatmentId: string) => {
    setSelectedTreatments(prev => 
      prev.includes(treatmentId) 
        ? prev.filter(id => id !== treatmentId) 
        : [...prev, treatmentId]
    );
  };

  const relevantInteractions = findInteractions();
  
  // Helper function to get appropriate icon based on severity
  const getInteractionIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'moderate':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'variable':
      case 'unknown':
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  // Get severity color for badges
  const getSeverityColor = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (severity.toLowerCase()) {
      case 'high':
        return "destructive";
      case 'moderate':
        return "default";
      case 'low':
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Compatibility Checker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Select your current conventional treatments to check for potential interactions with {treatment.name}.
        </p>
        
        <div className="space-y-6">
          {Object.entries(groupedTreatments).map(([category, treatments]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {treatments.map(t => (
                  <div key={t.id} className="flex items-start space-x-2 border rounded-md p-2">
                    <Checkbox 
                      id={t.id}
                      checked={selectedTreatments.includes(t.id)}
                      onCheckedChange={() => handleTreatmentToggle(t.id)}
                    />
                    <div className="grid gap-1">
                      <Label
                        htmlFor={t.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {t.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {selectedTreatments.length > 0 && (
          <Button
            className="mt-4"
            onClick={() => setShowInteractions(true)}
          >
            Check Compatibility
          </Button>
        )}
        
        {showInteractions && (
          <div className="mt-6 space-y-4">
            <h3 className="font-bold text-lg">Compatibility Results</h3>
            
            {relevantInteractions.length === 0 ? (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">No Known Interactions Detected</AlertTitle>
                <AlertDescription className="text-green-700">
                  No significant interactions were found between {treatment.name} and your selected conventional treatments. 
                  However, always consult with your healthcare provider before adding any complementary therapy to your treatment plan.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Potential Interactions Detected</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    The following potential interactions have been identified. Discuss these with your healthcare team before proceeding.
                  </AlertDescription>
                </Alert>
                
                {relevantInteractions.map((item, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getInteractionIcon(item.interaction.severity)}
                        <span className="font-medium">{item.conventionalTreatment.name}</span>
                      </div>
                      <Badge variant={getSeverityColor(item.interaction.severity)}>
                        {item.interaction.severity} Risk
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm">{item.interaction.effect}</p>
                  </div>
                ))}
                
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Note: This information is based on current research and is not a substitute for professional medical advice. 
                  Always consult with your healthcare provider before combining treatments.
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInteractions(false);
                  setSelectedTreatments([]);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}