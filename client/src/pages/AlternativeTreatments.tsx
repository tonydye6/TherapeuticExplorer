
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
import {
  Heart,
  Search,
  Plus,
  Filter,
  Leaf,
  Microscope,
  FlaskConical,
  Star,
  ShieldCheck,
  Apple,
  PenTool,
  XIcon,
  Brain as BrainCircuitIcon
} from "lucide-react";

interface CategoryWithIcon {
  id: string;
  name: string;
  icon: React.ReactNode;
  colorClass?: string;
}

const PREDEFINED_CATEGORIES: CategoryWithIcon[] = [
  {
    id: "herbal-compounds",
    name: "Herbal & Plant Extracts",
    icon: <Leaf className="h-4 w-4" />,
    colorClass: "text-sophera-brand-primary"
  },
  {
    id: "alt-protocols",
    name: "Integrative Protocols",
    icon: <FlaskConical className="h-4 w-4" />,
    colorClass: "text-sophera-accent-secondary"
  },
  {
    id: "biological",
    name: "Biological Therapies",
    icon: <Microscope className="h-4 w-4" />,
    colorClass: "text-sophera-accent-tertiary"
  },
  {
    id: "nutritional-therapy",
    name: "Nutritional Therapy",
    icon: <Apple className="h-4 w-4" />,
    colorClass: "text-green-500"
  },
  {
    id: "mind-body-therapy",
    name: "Mind-Body Practices",
    icon: <BrainCircuitIcon className="h-4 w-4" />,
    colorClass: "text-purple-500"
  },
  {
    id: "traditional-chinese-medicine",
    name: "Traditional & Energy",
    icon: <PenTool className="h-4 w-4" />,
    colorClass: "text-blue-500"
  }
];

const EVIDENCE_LEVELS = ["Strong", "Moderate", "Limited", "Preliminary", "Anecdotal", "Insufficient"];
const SAFETY_PROFILES = ["Very Safe", "Generally Safe", "Safe with Precautions", "Use with Caution", "Potentially Harmful"];
const APPROACH_TYPES = ["Preventative", "Supportive", "Symptom Management", "Direct Treatment", "Recovery Support"];

interface FilterOptions {
  evidenceLevel: string[];
  safetyProfile: string[];
  approachType: string[];
}

export default function AlternativeTreatmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<AlternativeTreatment | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    evidenceLevel: [],
    safetyProfile: [],
    approachType: []
  });

  const queryClient = useQueryClient();

  const { data: treatments = [], isLoading, error } = useQuery({
    queryKey: ['/api/alternative-treatments'],
    queryFn: async () => {
      return apiRequest<AlternativeTreatment[]>('/api/alternative-treatments');
    }
  });

  const toggleFilter = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prevFilters => {
      const currentFilters = [...prevFilters[filterType]];
      const index = currentFilters.indexOf(value);
      if (index === -1) {
        return { ...prevFilters, [filterType]: [...currentFilters, value] };
      } else {
        currentFilters.splice(index, 1);
        return { ...prevFilters, [filterType]: currentFilters };
      }
    });
  };

  const clearFilters = () => {
    setFilters({ evidenceLevel: [], safetyProfile: [], approachType: [] });
  };

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = !searchTerm ||
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const currentCategory = PREDEFINED_CATEGORIES.find(c => c.id === activeCategory);
    const matchesCategory = !activeCategory || !currentCategory || treatment.category === currentCategory.name;
    
    const matchesEvidenceLevel = filters.evidenceLevel.length === 0 ||
      (treatment.evidenceRating && filters.evidenceLevel.includes(treatment.evidenceRating));
    const matchesSafetyProfile = filters.safetyProfile.length === 0 ||
      (treatment.safetyRating && filters.safetyProfile.includes(treatment.safetyRating));
    const matchesApproachType = filters.approachType.length === 0;

    return matchesSearch && matchesCategory && matchesEvidenceLevel &&
           matchesSafetyProfile && matchesApproachType;
  });

  const toggleFavorite = async (id: number) => {
    try {
      await apiRequest<AlternativeTreatment>(`/api/alternative-treatments/${id}/toggle-favorite`, { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['/api/alternative-treatments'] });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleTreatmentAdded = () => {
    setShowAddForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/alternative-treatments'] });
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading mb-8 text-center md:text-left">
        Explore Complementary & Alternative Approaches
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center w-full md:max-w-lg relative">
          <Search className="h-5 w-5 text-sophera-text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search treatments, conditions, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 rounded-sophera-input pl-10 pr-4 w-full text-base"
          />
        </div>

        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 rounded-sophera-button px-5 text-base">
                <Filter className="h-5 w-5 mr-2 text-sophera-brand-primary" />
                Filters
                {Object.values(filters).flat().length > 0 && (
                  <Badge className="ml-2 h-6 px-2 rounded-md bg-sophera-accent-secondary text-white">
                    {Object.values(filters).flat().length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-sophera-card shadow-xl p-2" align="end">
              <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-sophera-text-heading">
                Filter By
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-sophera-border-primary" />

              <DropdownMenuLabel className="px-2 pt-2 pb-1 text-xs font-medium text-sophera-text-subtle">
                Evidence Level
              </DropdownMenuLabel>
              {EVIDENCE_LEVELS.map(level => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={filters.evidenceLevel.includes(level)}
                  onCheckedChange={() => toggleFilter('evidenceLevel', level)}
                  className="text-sm text-sophera-text-body rounded-md"
                >
                  <Star className={`h-4 w-4 mr-2 ${
                    level === 'Strong' ? 'text-green-500 fill-green-500' :
                    level === 'Moderate' ? 'text-blue-500 fill-blue-500' :
                    level === 'Limited' ? 'text-yellow-500 fill-yellow-500' :
                    'text-sophera-text-subtle fill-sophera-text-subtle'
                  }`} />
                  {level}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator className="my-2 bg-sophera-border-primary"/>

              <DropdownMenuLabel className="px-2 pt-2 pb-1 text-xs font-medium text-sophera-text-subtle">
                Safety Profile
              </DropdownMenuLabel>
              {SAFETY_PROFILES.map(profile => (
                <DropdownMenuCheckboxItem
                  key={profile}
                  checked={filters.safetyProfile.includes(profile)}
                  onCheckedChange={() => toggleFilter('safetyProfile', profile)}
                  className="text-sm text-sophera-text-body rounded-md"
                >
                  <ShieldCheck className={`h-4 w-4 mr-2 ${
                    profile === 'Very Safe' ? 'text-green-500 fill-green-500' :
                    profile === 'Generally Safe' ? 'text-blue-500 fill-blue-500' :
                    profile === 'Safe with Precautions' ? 'text-yellow-500 fill-yellow-500' :
                    profile === 'Use with Caution' ? 'text-orange-500 fill-orange-500' :
                    'text-red-500 fill-red-500'
                  }`} />
                  {profile}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator className="my-2 bg-sophera-border-primary"/>
              
              <DropdownMenuLabel className="px-2 pt-2 pb-1 text-xs font-medium text-sophera-text-subtle">
                Approach Type
              </DropdownMenuLabel>
              {APPROACH_TYPES.map(type => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.approachType.includes(type)}
                  onCheckedChange={() => toggleFilter('approachType', type)}
                  className="text-sm text-sophera-text-body rounded-md"
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator className="my-2 bg-sophera-border-primary"/>

              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-sophera-button border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setShowAddForm(true)}
            className="h-12 rounded-sophera-button px-5 text-base bg-sophera-accent-secondary hover:bg-sophera-accent-secondary-hover"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Approach
          </Button>
        </div>
      </div>

      {Object.values(filters).flat().length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <span className="text-sm text-sophera-text-subtle mr-1">Active Filters:</span>
          {filters.evidenceLevel.map(level => (
            <Badge
              key={`el-${level}`}
              variant="secondary"
              className="rounded-md bg-sophera-brand-primary-light text-sophera-brand-primary border-sophera-brand-primary text-xs h-7"
            >
              <Star className="h-3.5 w-3.5 mr-1.5" /> {level}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 p-0 hover:bg-sophera-brand-primary/20 rounded-full"
                onClick={() => toggleFilter('evidenceLevel', level)}
              >
                <XIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
          {filters.safetyProfile.map(profile => (
            <Badge
              key={`sp-${profile}`}
              variant="secondary"
              className="rounded-md bg-sophera-brand-primary-light text-sophera-brand-primary border-sophera-brand-primary text-xs h-7"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> {profile}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 p-0 hover:bg-sophera-brand-primary/20 rounded-full"
                onClick={() => toggleFilter('safetyProfile', profile)}
              >
                <XIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
          {filters.approachType.map(type => (
            <Badge
              key={`at-${type}`}
              variant="secondary"
              className="rounded-md bg-sophera-brand-primary-light text-sophera-brand-primary border-sophera-brand-primary text-xs h-7"
            >
              {type}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 p-0 hover:bg-sophera-brand-primary/20 rounded-full"
                onClick={() => toggleFilter('approachType', type)}
              >
                <XIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
          {Object.values(filters).flat().length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-sophera-text-subtle hover:text-sophera-brand-primary"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      <Tabs
        defaultValue="all"
        value={activeCategory || "all"}
        onValueChange={(value) => setActiveCategory(value === "all" ? null : value)}
        className="w-full"
      >
        <div className="mb-6 border-b border-sophera-border-primary">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1 h-auto p-1 bg-sophera-gradient-start rounded-sophera-button">
            <TabsTrigger
              value="all"
              className="text-sm data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-10"
            >
              All Approaches
            </TabsTrigger>
            {PREDEFINED_CATEGORIES.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-sm data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-10 flex items-center justify-center gap-1.5"
              >
                <span className={category.colorClass}>{category.icon}</span>
                {category.name}
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="favorites"
              className="text-sm data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-10 flex items-center justify-center gap-1.5"
            >
              <Heart className="h-4 w-4 text-red-500" /> Favorites
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <TreatmentGrid
            treatments={filteredTreatments}
            onSelect={setSelectedTreatment}
            onToggleFavorite={toggleFavorite}
          />
        </TabsContent>

        {PREDEFINED_CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-0">
            <div className="mb-6 flex items-center">
              <h2 className={`text-2xl font-bold text-sophera-text-heading flex items-center gap-2 ${category.colorClass}`}>
                {category.icon} {category.name}
              </h2>
            </div>
            <TreatmentGrid
              treatments={filteredTreatments.filter(t => t.category === category.name)}
              onSelect={setSelectedTreatment}
              onToggleFavorite={toggleFavorite}
            />
          </TabsContent>
        ))}

        <TabsContent value="favorites" className="mt-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-sophera-text-heading flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" /> Your Favorite Approaches
            </h2>
          </div>
          <TreatmentGrid
            treatments={filteredTreatments.filter(t => t.isFavorite)}
            onSelect={setSelectedTreatment}
            onToggleFavorite={toggleFavorite}
            emptyStateMessage="No favorite treatments yet. Click the heart icon on any treatment card to add it to your favorites."
            emptyIcon={<Heart className="h-12 w-12 mx-auto mb-3 text-sophera-text-subtle/50" />}
          />
        </TabsContent>
      </Tabs>

      {selectedTreatment && (
        <Dialog open={!!selectedTreatment} onOpenChange={(open) => !open && setSelectedTreatment(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-sophera-modal-outer">
            <DialogHeader className="px-6 py-4 border-b border-sophera-border-primary sticky top-0 bg-sophera-bg-card z-10 rounded-t-sophera-modal-outer">
              <DialogTitle className="text-2xl font-bold text-sophera-text-heading">
                {selectedTreatment.name}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <AlternativeTreatmentDetails treatment={selectedTreatment} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl p-0 rounded-sophera-modal-outer">
          <DialogHeader className="px-6 py-4 border-b border-sophera-border-primary sticky top-0 bg-sophera-bg-card z-10 rounded-t-sophera-modal-outer">
            <DialogTitle className="text-2xl font-bold text-sophera-text-heading">Add New Approach</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <AlternativeTreatmentForm onSuccess={handleTreatmentAdded} onCancel={() => setShowAddForm(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TreatmentGrid({
  treatments,
  onSelect,
  onToggleFavorite,
  emptyStateMessage = "No approaches found matching your criteria. Try adjusting your search or filters.",
  emptyIcon = <Search className="h-12 w-12 mx-auto mb-3 text-sophera-text-subtle/50" />
}: {
  treatments: AlternativeTreatment[];
  onSelect: (treatment: AlternativeTreatment) => void;
  onToggleFavorite: (id: number) => void;
  emptyStateMessage?: string;
  emptyIcon?: React.ReactNode;
}) {
  if (treatments.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-sophera-text-body bg-sophera-bg-card rounded-sophera-card p-8 shadow-sm">
        {emptyIcon}
        <p className="text-lg">{emptyStateMessage}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {treatments.map((treatment) => (
        <TreatmentCard
          key={treatment.id}
          treatment={treatment}
          onSelect={() => onSelect(treatment)}
          onToggleFavorite={() => onToggleFavorite(treatment.id)}
        />
      ))}
    </div>
  );
}

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
    <Card
      className="h-full flex flex-col bg-sophera-bg-card border border-sophera-border-primary rounded-sophera-card shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer"
      onClick={onSelect}
    >
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-sophera-text-heading leading-tight">
            {treatment.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-sophera-text-subtle hover:bg-sophera-accent-secondary/10 hover:text-sophera-accent-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                treatment.isFavorite
                  ? 'fill-sophera-accent-secondary text-sophera-accent-secondary'
                  : 'text-sophera-text-subtle'
              }`}
            />
          </Button>
        </div>
        <Badge
          variant="outline"
          className="w-fit mt-1 text-xs rounded-md border-sophera-border-primary text-sophera-text-subtle bg-sophera-gradient-start px-2 py-0.5"
        >
          {treatment.category}
        </Badge>
      </CardHeader>
      <CardContent className="pb-4 px-5 flex-grow">
        <p className="text-sm text-sophera-text-body line-clamp-3">
          {treatment.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-3 pb-5 px-5 border-t border-sophera-border-primary/50">
        <div className="flex items-center text-sm">
          <span className="font-semibold text-sophera-text-body mr-2">Evidence:</span>
          <Badge
            className={`text-xs rounded-md px-2.5 py-1 ${
              treatment.evidenceRating === 'Strong'
                ? 'bg-green-100 text-green-700 border-green-300'
                : treatment.evidenceRating === 'Moderate'
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : treatment.evidenceRating === 'Limited'
                ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                : 'bg-sophera-gradient-start text-sophera-text-subtle border-sophera-border-primary'
            }`}
            variant="outline"
          >
            {treatment.evidenceRating}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="rounded-sophera-button text-xs border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
