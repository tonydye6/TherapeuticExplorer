import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlternativeTreatment } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AlternativeTreatmentForm from "@/components/AlternativeTreatmentForm";
import AlternativeTreatmentDetails from "@/components/AlternativeTreatmentDetails";
import { 
  Heart, Search, Plus, Filter, Leaf, Microscope, FlaskConical, 
  Star, ShieldCheck, Clipboard, Users, Apple, PenTool, Utensils
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define treatment categories with icons
interface CategoryWithIcon {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const PREDEFINED_CATEGORIES: CategoryWithIcon[] = [
  {
    id: "herbal-compounds",
    name: "Herbal Compounds and Plant Extracts",
    icon: <Leaf className="h-4 w-4 mr-1" />
  },
  {
    id: "alt-protocols",
    name: "Alt Protocols",
    icon: <FlaskConical className="h-4 w-4 mr-1" />
  },
  {
    id: "biological",
    name: "Biological",
    icon: <Microscope className="h-4 w-4 mr-1" />
  },
  {
    id: "nutritional-therapy",
    name: "Nutritional Therapy",
    icon: <Leaf className="h-4 w-4 mr-1" />
  },
  {
    id: "mind-body-therapy",
    name: "Mind-Body Therapy",
    icon: <FlaskConical className="h-4 w-4 mr-1" />
  },
  {
    id: "traditional-chinese-medicine",
    name: "Traditional Chinese Medicine",
    icon: <Microscope className="h-4 w-4 mr-1" />
  }
];

// Define filter options
interface FilterOptions {
  evidenceLevel: string[];
  safetyProfile: string[];
  approachType: string[];
}

// Constants for filter options
const EVIDENCE_LEVELS = ["Strong", "Moderate", "Limited", "Preliminary", "Anecdotal", "Insufficient"];
const SAFETY_PROFILES = ["Very Safe", "Generally Safe", "Safe with Precautions", "Use with Caution", "Potentially Harmful"];
const APPROACH_TYPES = ["Preventative", "Supportive", "Symptom Management", "Direct Treatment", "Recovery Support"];

export default function AlternativeTreatments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<AlternativeTreatment | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showNutritionalSection, setShowNutritionalSection] = useState(false);
  const [showPatientExperiences, setShowPatientExperiences] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  
  // Filtering state
  const [filters, setFilters] = useState<FilterOptions>({
    evidenceLevel: [],
    safetyProfile: [],
    approachType: []
  });
  

  
  const queryClient = useQueryClient();

  // Fetch alternative treatments
  const { data: treatments = [], isLoading, error } = useQuery({
    queryKey: ['/api/alternative-treatments'],
    queryFn: async () => {
      return apiRequest<AlternativeTreatment[]>('/api/alternative-treatments');
    }
  });

  // Handle toggling a filter
  const toggleFilter = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prevFilters => {
      const currentFilters = [...prevFilters[filterType]];
      const index = currentFilters.indexOf(value);
      
      if (index === -1) {
        // Add the filter
        return {
          ...prevFilters,
          [filterType]: [...currentFilters, value]
        };
      } else {
        // Remove the filter
        currentFilters.splice(index, 1);
        return {
          ...prevFilters,
          [filterType]: currentFilters
        };
      }
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      evidenceLevel: [],
      safetyProfile: [],
      approachType: []
    });
  };

  // Filter treatments based on search term, active category, and selected filters
  const filteredTreatments = treatments.filter(treatment => {
    // Search term filter
    const matchesSearch = !searchTerm || 
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = !activeCategory || 
      treatment.category === activeCategory || 
      (activeCategory === "herbal-compounds" && treatment.category === "Herbal Compounds and Plant Extracts") ||
      (activeCategory === "alt-protocols" && treatment.category === "Alt Protocols") ||
      (activeCategory === "biological" && treatment.category === "Biological") ||
      (activeCategory === "nutritional-therapy" && treatment.category === "Nutritional Therapy") ||
      (activeCategory === "mind-body-therapy" && treatment.category === "Mind-Body Therapy") ||
      (activeCategory === "traditional-chinese-medicine" && treatment.category === "Traditional Chinese Medicine");
    
    // Evidence level filter
    const matchesEvidenceLevel = filters.evidenceLevel.length === 0 || 
      (treatment.evidenceRating && filters.evidenceLevel.includes(treatment.evidenceRating));
    
    // Safety profile filter
    const matchesSafetyProfile = filters.safetyProfile.length === 0 || 
      (treatment.safetyRating && filters.safetyProfile.includes(treatment.safetyRating));
    
    // Approach type filter (this is a placeholder as we don't have this field yet in the data model)
    // In a real implementation, we would check against an actual property in the treatment data
    const matchesApproachType = filters.approachType.length === 0;
    
    return matchesSearch && matchesCategory && matchesEvidenceLevel && 
           matchesSafetyProfile && matchesApproachType;
  });

  // Get unique categories from treatments
  const categories = [...new Set(treatments.map(t => t.category))];

  // Toggle favorite status
  const toggleFavorite = async (id: number) => {
    try {
      await apiRequest<AlternativeTreatment>(
        `/api/alternative-treatments/${id}/toggle-favorite`, 
        { method: 'POST' }
      );
      queryClient.invalidateQueries({ queryKey: ['/api/alternative-treatments'] });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Handle form submission
  const handleTreatmentAdded = () => {
    setShowAddForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/alternative-treatments'] });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Non-Traditional Treatment Explorer</h1>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full max-w-md space-x-2">
          <Input
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10">
                <Filter className="h-4 w-4 mr-2" /> 
                Filters 
                {Object.values(filters).flat().length > 0 && (
                  <Badge className="ml-2 h-5 px-1.5" variant="secondary">
                    {Object.values(filters).flat().length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Filter By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Evidence Level Filters */}
              <DropdownMenuLabel className="text-xs font-medium">Evidence Level</DropdownMenuLabel>
              {EVIDENCE_LEVELS.map(level => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={filters.evidenceLevel.includes(level)}
                  onCheckedChange={() => toggleFilter('evidenceLevel', level)}
                >
                  <div className="flex items-center">
                    <Star className={`h-3.5 w-3.5 mr-2 ${
                      level === 'Strong' ? 'text-green-500' : 
                      level === 'Moderate' ? 'text-blue-500' : 
                      level === 'Limited' ? 'text-yellow-500' :
                      level === 'Preliminary' ? 'text-orange-500' :
                      'text-gray-400'
                    }`} />
                    {level}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              
              {/* Safety Profile Filters */}
              <DropdownMenuLabel className="text-xs font-medium">Safety Profile</DropdownMenuLabel>
              {SAFETY_PROFILES.map(profile => (
                <DropdownMenuCheckboxItem
                  key={profile}
                  checked={filters.safetyProfile.includes(profile)}
                  onCheckedChange={() => toggleFilter('safetyProfile', profile)}
                >
                  <div className="flex items-center">
                    <ShieldCheck className={`h-3.5 w-3.5 mr-2 ${
                      profile === 'Very Safe' ? 'text-green-500' : 
                      profile === 'Generally Safe' ? 'text-blue-500' : 
                      profile === 'Safe with Precautions' ? 'text-yellow-500' :
                      profile === 'Use with Caution' ? 'text-orange-500' :
                      'text-red-500'
                    }`} />
                    {profile}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              
              {/* Approach Type Filters */}
              <DropdownMenuLabel className="text-xs font-medium">Approach Type</DropdownMenuLabel>
              {APPROACH_TYPES.map(type => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.approachType.includes(type)}
                  onCheckedChange={() => toggleFilter('approachType', type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              
              {/* Reset Filters */}
              <div className="p-2">
                <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Add Treatment Button */}
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Treatment
          </Button>
        </div>
      </div>
      
      {/* Filter badges - show active filters */}
      {Object.values(filters).flat().length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.evidenceLevel.map(level => (
            <Badge key={level} variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" /> {level}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 p-0" 
                onClick={() => toggleFilter('evidenceLevel', level)}
              >
                <span className="sr-only">Remove</span>
                &times;
              </Button>
            </Badge>
          ))}
          
          {filters.safetyProfile.map(profile => (
            <Badge key={profile} variant="secondary" className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> {profile}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 p-0" 
                onClick={() => toggleFilter('safetyProfile', profile)}
              >
                <span className="sr-only">Remove</span>
                &times;
              </Button>
            </Badge>
          ))}
          
          {filters.approachType.map(type => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              {type}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 p-0" 
                onClick={() => toggleFilter('approachType', type)}
              >
                <span className="sr-only">Remove</span>
                &times;
              </Button>
            </Badge>
          ))}
          
          {Object.values(filters).flat().length > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs" 
              onClick={clearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-4">
        {/* Categories Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10">
              <Microscope className="h-4 w-4 mr-2" /> 
              Categories
              {activeCategory && (
                <Badge className="ml-2 h-5 px-1.5" variant="secondary">1</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Select Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuCheckboxItem
              checked={activeCategory === null}
              onCheckedChange={() => setActiveCategory(null)}
            >
              All Categories
            </DropdownMenuCheckboxItem>
            
            {PREDEFINED_CATEGORIES.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.id}
                checked={activeCategory === category.id}
                onCheckedChange={() => setActiveCategory(category.id)}
              >
                <div className="flex items-center">
                  {category.icon}
                  <span className="ml-2">{category.name}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={activeCategory === 'favorites'}
              onCheckedChange={() => setActiveCategory('favorites')}
            >
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                <span>Favorites</span>
              </div>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Selected category badge */}
        {activeCategory && (
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1"
            onClick={() => setActiveCategory(null)}
          >
            {activeCategory === 'favorites' ? (
              <>
                <Heart className="h-3 w-3" /> Favorites
              </>
            ) : (
              <>
                {/* Find and display the appropriate category icon */}
                {PREDEFINED_CATEGORIES.find(c => c.id === activeCategory)?.icon || <Microscope className="h-3 w-3 mr-1" />}
                {PREDEFINED_CATEGORIES.find(c => c.id === activeCategory)?.name || activeCategory}
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 ml-1 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                setActiveCategory(null);
              }}
            >
              <span className="sr-only">Remove</span>
              &times;
            </Button>
          </Badge>
        )}
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        
        {/* All treatments tab */}
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTreatments.map((treatment) => (
              <TreatmentCard 
                key={treatment.id} 
                treatment={treatment} 
                onSelect={() => setSelectedTreatment(treatment)}
                onToggleFavorite={() => toggleFavorite(treatment.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Predefined category tabs */}
        {PREDEFINED_CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-0">
            <div className="mb-4 flex items-center">
              <h2 className="text-xl font-semibold flex items-center">
                {category.icon} {category.name}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTreatments
                .filter(t => 
                  t.category === category.name || 
                  (category.id === "herbal-compounds" && t.category === "Herbal Compounds and Plant Extracts") ||
                  (category.id === "alt-protocols" && t.category === "Alt Protocols") ||
                  (category.id === "biological" && t.category === "Biological") ||
                  (category.id === "nutritional-therapy" && t.category === "Nutritional Therapy") ||
                  (category.id === "mind-body-therapy" && t.category === "Mind-Body Therapy") ||
                  (category.id === "traditional-chinese-medicine" && t.category === "Traditional Chinese Medicine")
                )
                .map((treatment) => (
                  <TreatmentCard 
                    key={treatment.id} 
                    treatment={treatment} 
                    onSelect={() => setSelectedTreatment(treatment)}
                    onToggleFavorite={() => toggleFavorite(treatment.id)}
                  />
                ))
              }
            </div>
          </TabsContent>
        ))}
        
        {/* Favorites tab */}
        <TabsContent value="favorites" className="mt-0">
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-500" /> Favorite Treatments
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTreatments
              .filter(t => t.isFavorite)
              .map((treatment) => (
                <TreatmentCard 
                  key={treatment.id} 
                  treatment={treatment} 
                  onSelect={() => setSelectedTreatment(treatment)}
                  onToggleFavorite={() => toggleFavorite(treatment.id)}
                />
              ))
            }
            {filteredTreatments.filter(t => t.isFavorite).length === 0 && (
              <div className="col-span-3 py-10 text-center text-muted-foreground">
                <Heart className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                <p>No favorite treatments yet. Click the heart icon on any treatment card to add it to your favorites.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Treatment details dialog */}
      {selectedTreatment && (
        <Dialog open={!!selectedTreatment} onOpenChange={(open) => !open && setSelectedTreatment(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTreatment.name}</DialogTitle>
            </DialogHeader>
            <AlternativeTreatmentDetails treatment={selectedTreatment} />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add treatment form dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add Non-Traditional Treatment</DialogTitle>
          </DialogHeader>
          <AlternativeTreatmentForm onSuccess={handleTreatmentAdded} onCancel={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Treatment card component
function TreatmentCard({ 
  treatment, 
  onSelect, 
  onToggleFavorite 
}: { 
  treatment: AlternativeTreatment; 
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{treatment.name}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart 
              className={`h-5 w-5 ${treatment.isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
            />
          </Button>
        </div>
        <Badge variant="outline" className="w-fit">
          {treatment.category}
        </Badge>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {treatment.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="font-semibold mr-2">Evidence:</span>
          <Badge variant={
            treatment.evidenceRating === 'Strong' ? 'default' :
            treatment.evidenceRating === 'Moderate' ? 'secondary' :
            'outline'
          }>
            {treatment.evidenceRating}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onSelect}>
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}