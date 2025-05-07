import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResearchItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen, FlaskRound, FlaskConical, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ResearchSummaryCard from "@/components/ResearchSummaryCard";
import ResearchDetailsDialog from "@/components/ResearchDetailsDialog";

export default function SavedResearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedResearchItem, setSelectedResearchItem] = useState<ResearchItem | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: researchItems = [], isLoading, error } = useQuery({
    queryKey: ['/api/research/saved'],
    queryFn: async () => {
      return apiRequest<ResearchItem[]>('/api/research/saved');
    }
  });

  const { mutate: removeResearchItem } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/research/saved/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research/saved'] });
      toast({
        title: "Item removed",
        description: "The research item has been removed from your saved items.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove the research item. Please try again.",
        variant: "destructive",
      });
    }
  });

  const filteredItems = researchItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || 
      item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const itemsByCategory: Record<string, ResearchItem[]> = {};
  filteredItems.forEach(item => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });

  const handleViewDetails = (item: ResearchItem) => {
    setSelectedResearchItem(item);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-sophera-text-heading flex items-center">
            <BookOpen className="h-8 w-8 mr-3 text-sophera-brand-primary" />
            Saved Research
          </h1>
          <p className="text-lg text-sophera-text-body mt-2">
            Access your saved articles, studies, and other research materials
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sophera-text-subtle" />
            <Input
              placeholder="Search saved research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-sophera-border-subtle rounded-sophera-input w-full sm:w-[250px] bg-white focus:border-sophera-brand-primary focus:ring-sophera-brand-primary-focusRing"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-sophera-border-subtle rounded-sophera-input bg-white">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="article">Scientific Articles</SelectItem>
              <SelectItem value="trial">Clinical Trials</SelectItem>
              <SelectItem value="treatment">Treatment Options</SelectItem>
              <SelectItem value="nutrition">Nutrition Research</SelectItem>
              <SelectItem value="alternative">Alternative Approaches</SelectItem>
              <SelectItem value="other">Other Research</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-sophera-brand-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <Card className="bg-sophera-error-light border-sophera-error rounded-sophera-card shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 h-12 w-12 bg-sophera-error/10 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-sophera-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sophera-text-heading mb-1">Unable to load saved research</h3>
                <p className="text-sophera-text-body">
                  We encountered a problem loading your saved research items. Please try refreshing the page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="bg-white border-sophera-border-subtle rounded-sophera-card shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-sophera-brand-primary-light rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-sophera-brand-primary" />
            </div>
            <h3 className="text-xl font-semibold text-sophera-text-heading mb-2">
              {searchQuery || categoryFilter !== "all" ? 
                "No matching research found" : 
                "No saved research yet"}
            </h3>
            <p className="text-sophera-text-body max-w-md text-center mb-6">
              {searchQuery || categoryFilter !== "all" ? 
                "Try different search terms or filters to find your saved research." : 
                "Start saving interesting articles, clinical trials, and treatments to access them easily later."}
            </p>
            {(searchQuery || categoryFilter !== "all") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                className="border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light rounded-sophera-button"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="h-auto p-1.5 bg-sophera-gradient-start rounded-sophera-button mb-6 gap-1.5">
              <TabsTrigger 
                value="all" 
                className="text-base data-[state=active]:bg-white data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11 flex items-center gap-1.5"
              >
                <BookOpen className="h-4 w-4" />
                All Research
              </TabsTrigger>
              <TabsTrigger 
                value="articles" 
                className="text-base data-[state=active]:bg-white data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11 flex items-center gap-1.5"
              >
                <Star className="h-4 w-4" />
                Scientific Articles
              </TabsTrigger>
              <TabsTrigger 
                value="trials" 
                className="text-base data-[state=active]:bg-white data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11 flex items-center gap-1.5"
              >
                <FlaskRound className="h-4 w-4" />
                Clinical Trials
              </TabsTrigger>
              <TabsTrigger 
                value="treatments" 
                className="text-base data-[state=active]:bg-white data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11 flex items-center gap-1.5"
              >
                <FlaskConical className="h-4 w-4" />
                Treatment Options
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0 space-y-8">
              {Object.entries(itemsByCategory).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl font-semibold text-sophera-text-heading flex items-center">
                    {category === "article" && <Star className="h-5 w-5 mr-2 text-sophera-accent-secondary" />}
                    {category === "trial" && <FlaskRound className="h-5 w-5 mr-2 text-sophera-accent-tertiary" />}
                    {category === "treatment" && <FlaskConical className="h-5 w-5 mr-2 text-sophera-brand-primary" />}
                    {category === "nutrition" && <FlaskConical className="h-5 w-5 mr-2 text-sophera-accent-secondary" />}
                    {category === "alternative" && <FlaskConical className="h-5 w-5 mr-2 text-sophera-accent-tertiary" />}
                    {category === "other" && <BookOpen className="h-5 w-5 mr-2 text-sophera-brand-primary" />}
                    {category === "article" ? "Scientific Articles" : 
                     category === "trial" ? "Clinical Trials" : 
                     category === "treatment" ? "Treatment Options" : 
                     category === "nutrition" ? "Nutrition Research" : 
                     category === "alternative" ? "Alternative Approaches" : 
                     "Other Research"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <ResearchSummaryCard
                        key={item.id}
                        item={item}
                        onView={() => handleViewDetails(item)}
                        onRemove={() => removeResearchItem(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="articles" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems
                  .filter(item => item.category === "article")
                  .map((item) => (
                    <ResearchSummaryCard
                      key={item.id}
                      item={item}
                      onView={() => handleViewDetails(item)}
                      onRemove={() => removeResearchItem(item.id)}
                    />
                  ))}
              </div>
              {filteredItems.filter(item => item.category === "article").length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sophera-text-subtle">No scientific articles found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trials" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems
                  .filter(item => item.category === "trial")
                  .map((item) => (
                    <ResearchSummaryCard
                      key={item.id}
                      item={item}
                      onView={() => handleViewDetails(item)}
                      onRemove={() => removeResearchItem(item.id)}
                    />
                  ))}
              </div>
              {filteredItems.filter(item => item.category === "trial").length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sophera-text-subtle">No clinical trials found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="treatments" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems
                  .filter(item => item.category === "treatment")
                  .map((item) => (
                    <ResearchSummaryCard
                      key={item.id}
                      item={item}
                      onView={() => handleViewDetails(item)}
                      onRemove={() => removeResearchItem(item.id)}
                    />
                  ))}
              </div>
              {filteredItems.filter(item => item.category === "treatment").length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sophera-text-subtle">No treatment options found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {selectedResearchItem && (
        <ResearchDetailsDialog
          item={selectedResearchItem}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />
      )}
    </div>
  );
}