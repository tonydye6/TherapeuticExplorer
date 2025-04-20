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
import { Heart, Search, Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    
    const matchesCategory = !activeCategory || treatment.category === activeCategory;
    
    return matchesSearch && matchesCategory;
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
        <TabsList className="mb-4">
          <TabsTrigger value="all" onClick={() => setActiveCategory(null)}>
            All Categories
          </TabsTrigger>
          
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </TabsTrigger>
          ))}
          
          <TabsTrigger value="favorites">
            <Heart className="mr-2 h-4 w-4" /> Favorites
          </TabsTrigger>
        </TabsList>
        
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
        
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTreatments
                .filter(t => t.category === category)
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
        
        <TabsContent value="favorites" className="mt-0">
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