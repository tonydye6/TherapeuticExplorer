import { useState } from "react";
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
import { Heart, Search, Plus, Filter, Leaf, Microscope, FlaskConical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function AlternativeTreatments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<AlternativeTreatment | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch alternative treatments
  const { data: treatments = [], isLoading, error } = useQuery({
    queryKey: ['/api/alternative-treatments'],
    queryFn: async () => {
      return apiRequest<AlternativeTreatment[]>('/api/alternative-treatments');
    }
  });

  // Filter treatments based on search term and active category
  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = !searchTerm || 
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For predefined category tabs, we need to map category names to their IDs
    const matchesCategory = !activeCategory || 
      treatment.category === activeCategory || 
      (activeCategory === "herbal-compounds" && treatment.category === "Herbal Compounds and Plant Extracts") ||
      (activeCategory === "alt-protocols" && treatment.category === "Alt Protocols") ||
      (activeCategory === "biological" && treatment.category === "Biological") ||
      (activeCategory === "nutritional-therapy" && treatment.category === "Nutritional Therapy") ||
      (activeCategory === "mind-body-therapy" && treatment.category === "Mind-Body Therapy") ||
      (activeCategory === "traditional-chinese-medicine" && treatment.category === "Traditional Chinese Medicine");
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from treatments
  const categories = [...new Set(treatments.map(t => t.category))];
  
  // Format the category name for display
  const getCategoryDisplayName = (category: string): string => {
    const predefinedCategory = PREDEFINED_CATEGORIES.find(c => 
      c.id === category || c.name === category
    );
    return predefinedCategory?.name || category;
  };
  
  // Get icon for category
  const getCategoryIcon = (category: string) => {
    const predefinedCategory = PREDEFINED_CATEGORIES.find(c => 
      c.id === category || c.name === category
    );
    return predefinedCategory?.icon || null;
  };

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
    <div className="container py-6">
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
        
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Treatment
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all" onClick={() => setActiveCategory(null)}>
            All Categories
          </TabsTrigger>
          
          {/* Predefined categories */}
          {PREDEFINED_CATEGORIES.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              <div className="flex items-center">
                {category.icon}
                <span className="text-sm whitespace-nowrap">{category.name}</span>
              </div>
            </TabsTrigger>
          ))}
          
          <TabsTrigger value="favorites">
            <Heart className="mr-2 h-4 w-4" /> Favorites
          </TabsTrigger>
        </TabsList>
        
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