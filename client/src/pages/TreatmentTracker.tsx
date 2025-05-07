
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Pill,
  Zap,
  Calendar,
  AlertTriangle,
  BookOpen,
  Clock,
  Stethoscope,
  FilePlus,
  Trash2,
  Activity,
  CheckCircle2,
  XCircle,
  Syringe,
  Radiation,
  Scissors,
  Users,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

// Define Treatment type based on schema
interface Treatment {
  id: number;
  userId: string;
  name: string;
  type: string;
  startDate?: Date | null;
  endDate?: Date | null;
  notes?: string | null;
  sideEffects?: string[] | null;
  effectiveness?: any | null;
  active: boolean;
  frequency?: string;
  dosage?: string;
  provider?: string;
  location?: string;
}

// Treatment explanation data
const treatmentExplanations = {
  chemotherapy: {
    title: "Chemotherapy",
    icon: <Pill className="h-6 w-6 text-blue-600" />,
    description: "Chemotherapy uses drugs to destroy cancer cells by preventing them from growing and dividing. These medications circulate throughout your body to target rapidly dividing cells.",
    howItWorks: "These powerful drugs damage the DNA and proteins inside cancer cells, preventing them from growing and ultimately causing them to die. Because cancer cells divide more quickly than many healthy cells, they are more likely to be affected.",
    benefits: [
      "Can treat cancer throughout the body (systemic treatment)",
      "Proven effectiveness against many cancer types",
      "Can be used before or after surgery to improve outcomes"
    ],
    commonSideEffects: [
      "Fatigue and low energy",
      "Nausea and vomiting",
      "Hair loss",
      "Decreased blood cell counts",
      "Increased risk of infection"
    ],
    managingTips: [
      "Maintain good nutrition with small, frequent meals",
      "Stay hydrated by drinking plenty of fluids",
      "Rest when needed but try to stay active when possible",
      "Take all prescribed anti-nausea medications",
      "Practice good hygiene to prevent infections"
    ],
    questionsToAsk: [
      "What specific drugs will I receive?",
      "How many cycles of treatment are planned?",
      "What side effects should I expect with my specific regimen?",
      "How will we monitor whether the treatment is working?",
      "What should I do if I experience severe side effects?"
    ]
  },
  radiation: {
    title: "Radiation Therapy",
    icon: <Radiation className="h-6 w-6 text-orange-600" />,
    description: "Radiation therapy uses high-energy particles or waves to destroy or damage cancer cells by affecting their DNA, making it difficult or impossible for these cells to continue growing.",
    howItWorks: "Radiation damages the DNA inside cancer cells, preventing them from growing and dividing. The goal is to destroy cancer cells while minimizing damage to healthy tissue. This is achieved by precisely targeting the radiation beams to the tumor location.",
    benefits: [
      "Precisely targets specific areas where cancer is located",
      "Often causes fewer systemic side effects than chemotherapy",
      "Can be used to shrink tumors before surgery or eliminate remaining cancer cells after surgery",
      "May be curative for some cancers when used alone"
    ],
    commonSideEffects: [
      "Skin changes (redness, blistering) at treatment site",
      "Fatigue",
      "Inflammation of mucous membranes in the treatment area",
      "Temporary or permanent hair loss in the treatment area",
      "Specific side effects depend on the area being treated"
    ],
    managingTips: [
      "Gently clean the treatment area daily with mild soap and water",
      "Avoid using harsh skin products on the treatment area",
      "Protect the treatment area from sun exposure",
      "Maintain good nutrition and stay hydrated",
      "Schedule rest periods throughout the day"
    ],
    questionsToAsk: [
      "What type of radiation therapy will I receive?",
      "How long will my course of treatment last?",
      "What side effects should I expect for my specific treatment area?",
      "How will you protect my healthy tissues during treatment?",
      "How will we know if the radiation therapy is working?"
    ]
  },
  surgical: {
    title: "Surgical Treatment",
    icon: <Scissors className="h-6 w-6 text-gray-600" />,
    description: "Surgery physically removes the tumor and possibly some surrounding tissue. For esophageal cancer, this might involve removing part of the esophagus (esophagectomy) or other affected structures.",
    howItWorks: "Surgery directly removes cancer cells from the body. The surgeon removes the tumor and sometimes surrounding tissue or lymph nodes to eliminate as much of the cancer as possible. The extent of surgery depends on the cancer's stage and location.",
    benefits: [
      "Directly removes the tumor",
      "Provides tissue samples for precise diagnosis and staging",
      "May be curative for early-stage cancers",
      "Can relieve symptoms caused by the tumor"
    ],
    commonSideEffects: [
      "Pain at the surgical site",
      "Temporary difficulty swallowing",
      "Risk of infection",
      "Recovery time and limitations on activity",
      "Potential changes to digestive function"
    ],
    managingTips: [
      "Follow all post-operative instructions carefully",
      "Take pain medications as prescribed",
      "Attend all follow-up appointments",
      "Gradually increase activity as advised by your medical team",
      "Be vigilant for signs of infection at the surgical site"
    ],
    questionsToAsk: [
      "What type of surgical procedure will I have?",
      "What are the potential complications specific to this surgery?",
      "How long will I need to stay in the hospital?",
      "What restrictions will I have during recovery?",
      "How will this surgery affect my daily life and functions?"
    ]
  },
  immunotherapy: {
    title: "Immunotherapy",
    icon: <ShieldAlert className="h-6 w-6 text-green-600" />,
    description: "Immunotherapy helps your immune system recognize and attack cancer cells more effectively. These treatments work with your body's natural defenses rather than directly attacking cancer cells.",
    howItWorks: "Immunotherapy works by helping your immune system recognize and attack cancer cells. These treatments can work in several ways: boosting your overall immune response, removing barriers that protect cancer cells, or specifically targeting cancer cells for immune system attack.",
    benefits: [
      "May work when other treatments have failed",
      "Can provide long-lasting responses in some patients",
      "Sometimes causes fewer traditional side effects than chemotherapy",
      "May continue working after treatment has ended"
    ],
    commonSideEffects: [
      "Fatigue",
      "Skin reactions (rash, itching)",
      "Flu-like symptoms (fever, chills)",
      "Autoimmune reactions affecting various organs",
      "Inflammation in different parts of the body"
    ],
    managingTips: [
      "Report all side effects promptly to your healthcare team",
      "Stay hydrated and maintain good nutrition",
      "Rest as needed but remain moderately active when possible",
      "Follow all instructions for medications to manage side effects",
      "Track your symptoms in a journal to discuss with your doctor"
    ],
    questionsToAsk: [
      "Am I a good candidate for immunotherapy?",
      "Which specific immunotherapy drug is recommended for me?",
      "How will you monitor for immune-related side effects?",
      "How will we know if the immunotherapy is working?",
      "How long will I need to remain on this treatment?"
    ]
  },
  targeted: {
    title: "Targeted Therapy",
    icon: <Zap className="h-6 w-6 text-purple-600" />,
    description: "Targeted therapies focus on specific changes in cancer cells that help them grow, divide, and spread. These treatments specifically attack cancer cells while causing less harm to normal cells.",
    howItWorks: "Targeted therapies precisely identify and attack specific features of cancer cells, such as proteins that are abnormal or expressed in higher amounts. By focusing on these molecular targets, these drugs can block the growth and spread of cancer while limiting damage to healthy cells.",
    benefits: [
      "More precise than traditional chemotherapy",
      "Often causes fewer side effects than chemotherapy",
      "Can be effective when other treatments have failed",
      "May be taken as pills rather than requiring infusions"
    ],
    commonSideEffects: [
      "Skin problems (rash, dry skin, nail changes)",
      "High blood pressure",
      "Problems with wound healing",
      "Gastrointestinal symptoms (diarrhea, loss of appetite)",
      "Fatigue"
    ],
    managingTips: [
      "Use moisturizers for skin dryness",
      "Monitor your blood pressure regularly if recommended",
      "Report unusual symptoms promptly to your healthcare team",
      "Take medication exactly as prescribed",
      "Avoid sun exposure and use sun protection"
    ],
    questionsToAsk: [
      "Does my cancer have targets that can be treated with these therapies?",
      "What testing is needed to determine if targeted therapy is appropriate?",
      "How long will I need to take this medication?",
      "What specific side effects should I watch for with this particular drug?",
      "What happens if this targeted therapy stops working?"
    ]
  },
  supportive: {
    title: "Supportive Care",
    icon: <Users className="h-6 w-6 text-teal-600" />,
    description: "Supportive care focuses on improving your quality of life by preventing or treating symptoms of cancer and side effects of treatment. It addresses physical, emotional, social, and spiritual needs.",
    howItWorks: "Supportive care works alongside your primary cancer treatment to help manage symptoms and improve your well-being. It includes pain management, nutritional support, emotional counseling, and other services tailored to your specific needs throughout your cancer journey.",
    benefits: [
      "Improves quality of life during cancer treatment",
      "Helps manage side effects from primary treatments",
      "Provides emotional and psychological support",
      "Can improve overall treatment outcomes",
      "Addresses nutritional needs and physical functioning"
    ],
    commonApproaches: [
      "Pain management",
      "Nutritional counseling",
      "Psychological support",
      "Physical and occupational therapy",
      "Palliative care services"
    ],
    managingTips: [
      "Be open about all symptoms you experience",
      "Consider joining support groups",
      "Work with a nutritionist for dietary guidance",
      "Practice relaxation techniques for stress management",
      "Don't hesitate to ask for help with daily activities"
    ],
    questionsToAsk: [
      "What supportive care services are available at this facility?",
      "How can I manage specific side effects I'm experiencing?",
      "Are there support groups you would recommend?",
      "Should I see a nutritionist or dietitian?",
      "What resources are available for my family and caregivers?"
    ]
  }
};

// Add Treatment dialog component
const AddTreatmentDialog = ({ onAddTreatment }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState('');
  const [dosage, setDosage] = useState('');
  const [provider, setProvider] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  const { toast } = useToast();
  
  const handleSubmit = () => {
    if (!name || !type) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const newTreatment = {
      name,
      type,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      frequency,
      dosage,
      provider,
      location,
      notes,
      active: true
    };
    
    onAddTreatment(newTreatment);
    setOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setName('');
    setType('');
    setStartDate('');
    setEndDate('');
    setFrequency('');
    setDosage('');
    setProvider('');
    setLocation('');
    setNotes('');
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <FilePlus className="h-4 w-4" />
          Add Treatment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Treatment</DialogTitle>
          <DialogDescription>
            Enter the details of your treatment to add it to your treatment plan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name">Treatment Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. FLOT Chemotherapy"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="type">Treatment Type <span className="text-red-500">*</span></Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select treatment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chemotherapy">Chemotherapy</SelectItem>
                <SelectItem value="radiation">Radiation Therapy</SelectItem>
                <SelectItem value="surgical">Surgery</SelectItem>
                <SelectItem value="immunotherapy">Immunotherapy</SelectItem>
                <SelectItem value="targeted">Targeted Therapy</SelectItem>
                <SelectItem value="supportive">Supportive Care</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Daily, Weekly"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 100mg, 30Gy"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="provider">Healthcare Provider</Label>
              <Input
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Dr. Smith"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Memorial Hospital"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information or observations"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Add Treatment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Treatment card component
const TreatmentCard = ({ treatment, onDelete, onToggleActive }) => {
  const typeInfo = treatmentExplanations[treatment.type] || {
    title: "Other Treatment",
    icon: <Stethoscope className="h-6 w-6 text-gray-600" />,
  };
  
  // Format dates if they exist
  const formattedStartDate = treatment.startDate 
    ? format(new Date(treatment.startDate), 'MMM d, yyyy')
    : 'Not specified';
  
  const formattedEndDate = treatment.endDate
    ? format(new Date(treatment.endDate), 'MMM d, yyyy')
    : 'Ongoing';
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-full">
            {typeInfo.icon}
          </div>
          <div>
            <CardTitle className="text-xl">{treatment.name}</CardTitle>
            <CardDescription>{typeInfo.title}</CardDescription>
          </div>
        </div>
        <Badge variant={treatment.active ? "default" : "outline"}>
          {treatment.active ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Start Date</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formattedStartDate}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">End Date</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formattedEndDate}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {treatment.frequency && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Frequency</p>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{treatment.frequency}</span>
              </div>
            </div>
          )}
          
          {treatment.dosage && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Dosage</p>
              <div className="flex items-center">
                <Pill className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{treatment.dosage}</span>
              </div>
            </div>
          )}
        </div>
        
        {treatment.provider && treatment.location && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Provider & Location</p>
            <div className="flex items-center">
              <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{treatment.provider} at {treatment.location}</span>
            </div>
          </div>
        )}
        
        {treatment.notes && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              {treatment.notes}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onToggleActive(treatment.id, !treatment.active)}
        >
          {treatment.active ? (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Mark as Inactive
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Active
            </>
          )}
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete(treatment.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

// Treatment guide component
const TreatmentGuide = ({ treatmentType }) => {
  const info = treatmentExplanations[treatmentType];
  
  if (!info) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Guide Not Available</AlertTitle>
            <AlertDescription>
              A detailed guide for this treatment type is not available. Please consult with your healthcare provider for information.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-100 rounded-full">
          {info.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{info.title}</h2>
          <p className="text-muted-foreground">{info.description}</p>
        </div>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Note</AlertTitle>
        <AlertDescription>
          This information is for educational purposes only. Always consult your healthcare provider for personalized medical advice.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
          <TabsTrigger value="tips">Managing Tips</TabsTrigger>
          <TabsTrigger value="questions">Questions to Ask</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{info.howItWorks}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Key Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {info.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="side-effects" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Common Side Effects
              </CardTitle>
              <CardDescription>
                Side effects vary by individual. You may not experience all of these.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {info.commonSideEffects.map((effect, index) => (
                  <li key={index} className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tips" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Managing Your Treatment
              </CardTitle>
              <CardDescription>
                Tips to help minimize side effects and improve your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {info.managingTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <Info className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Questions to Ask Your Doctor
              </CardTitle>
              <CardDescription>
                Important questions to discuss with your healthcare provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {info.questionsToAsk.map((question, index) => (
                  <li key={index} className="flex items-start">
                    <Activity className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface TreatmentTrackerProps {
  inTabView?: boolean;
}

function TreatmentTracker({ inTabView }: TreatmentTrackerProps) {
  const [activeTab, setActiveTab] = useState('current');
  const [selectedTreatmentType, setSelectedTreatmentType] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch treatments
  const { data: treatments = [], isLoading } = useQuery({
    queryKey: ['/api/treatments'],
  });
  
  // Add treatment mutation
  const addTreatmentMutation = useMutation({
    mutationFn: async (newTreatment) => {
      const response = await apiRequest('POST', '/api/treatments', newTreatment);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/treatments'] });
      toast({
        title: "Treatment added",
        description: "Your treatment has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add treatment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete treatment mutation
  const deleteTreatmentMutation = useMutation({
    mutationFn: async (treatmentId) => {
      const response = await apiRequest('DELETE', `/api/treatments/${treatmentId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/treatments'] });
      toast({
        title: "Treatment removed",
        description: "Your treatment has been removed from your plan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove treatment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }) => {
      const response = await apiRequest('PATCH', `/api/treatments/${id}`, { active });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/treatments'] });
      toast({
        title: "Treatment updated",
        description: "Treatment status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update treatment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handleAddTreatment = (newTreatment) => {
    addTreatmentMutation.mutate(newTreatment);
  };
  
  const handleDeleteTreatment = (id) => {
    if (window.confirm('Are you sure you want to remove this treatment?')) {
      deleteTreatmentMutation.mutate(id);
    }
  };
  
  const handleToggleActive = (id, active) => {
    toggleActiveMutation.mutate({ id, active });
  };
  
  // Filter treatments based on active tab
  const activeTreatments = treatments.filter(t => t.active);
  const inactiveTreatments = treatments.filter(t => !t.active);
  
  // Get selected treatment for guide
  const selectedTreatment = treatments.find(t => 
    t.type === selectedTreatmentType
  );

  return (
    <div className={`space-y-8 ${!inTabView ? 'container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12' : ''}`}>
      {!inTabView && (
        <div className="text-center md:text-left">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading mb-2">Treatment Guides</h1>
          <p className="text-lg text-sophera-text-body">
            Track and understand your treatments with simplified explanations and guidance.
          </p>
        </div>
      )}
      
      <Tabs defaultValue="treatments" className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="treatments">Your Treatments</TabsTrigger>
          <TabsTrigger value="guide">Treatment Guides</TabsTrigger>
        </TabsList>
        
        <TabsContent value="treatments" className="space-y-6">
          <div className="flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="current">Active Treatments</TabsTrigger>
                <TabsTrigger value="past">Previous Treatments</TabsTrigger>
                <TabsTrigger value="all">All Treatments</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <AddTreatmentDialog onAddTreatment={handleAddTreatment} />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'current' && (
                <>
                  {activeTreatments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activeTreatments.map(treatment => (
                        <TreatmentCard 
                          key={treatment.id}
                          treatment={treatment}
                          onDelete={handleDeleteTreatment}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="flex flex-col items-center justify-center text-center p-6">
                        <Stethoscope className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Active Treatments</h3>
                        <p className="text-muted-foreground mb-4">
                          You don't have any active treatments in your plan. Add a treatment to get started.
                        </p>
                        <AddTreatmentDialog onAddTreatment={handleAddTreatment} />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
              
              {activeTab === 'past' && (
                <>
                  {inactiveTreatments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {inactiveTreatments.map(treatment => (
                        <TreatmentCard 
                          key={treatment.id}
                          treatment={treatment}
                          onDelete={handleDeleteTreatment}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="flex flex-col items-center justify-center text-center p-6">
                        <Stethoscope className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Previous Treatments</h3>
                        <p className="text-muted-foreground">
                          You don't have any previous treatments in your history.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
              
              {activeTab === 'all' && (
                <>
                  {treatments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {treatments.map(treatment => (
                        <TreatmentCard 
                          key={treatment.id}
                          treatment={treatment}
                          onDelete={handleDeleteTreatment}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="flex flex-col items-center justify-center text-center p-6">
                        <Stethoscope className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Treatments Added</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't added any treatments to your plan yet. Add your first treatment to get started.
                        </p>
                        <AddTreatmentDialog onAddTreatment={handleAddTreatment} />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Information Center</CardTitle>
              <CardDescription>
                Select a treatment type to view detailed information, management tips, and questions to ask your healthcare team.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {Object.entries(treatmentExplanations).map(([key, info]) => (
                  <Button
                    key={key}
                    variant={selectedTreatmentType === key ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col items-center text-center gap-2"
                    onClick={() => setSelectedTreatmentType(key)}
                  >
                    <div className="mb-2">
                      {info.icon}
                    </div>
                    <span>{info.title}</span>
                  </Button>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              {selectedTreatmentType ? (
                <ScrollArea className="h-[600px] pr-4">
                  <TreatmentGuide treatmentType={selectedTreatmentType} />
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Treatment Type</h3>
                  <p className="text-muted-foreground">
                    Choose a treatment type from the options above to view detailed information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TreatmentTracker;
