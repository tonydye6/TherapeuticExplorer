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

export default function SavedResearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [evidenceFilter, setEvidenceFilter] = useState("all");
  const [favoritesTab, setFavoritesTab] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch saved research items
  const { data: researchItems, isLoading, error } = useQuery<ResearchItem[]>({
    queryKey: ['/api/research'],
    throwOnError: true,
  });
  
  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/research/${id}/toggle-favorite`, { method: 'POST' });
    },
    onSuccess: (data) => {
      // Update the cache with the modified item
      queryClient.setQueryData<ResearchItem[]>(['/api/research'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(item => item.id === data.id ? data : item);
      });
      
      toast({
        title: data.isFavorite ? "Added to Favorites" : "Removed from Favorites",
        description: `"${data.title}" has been ${data.isFavorite ? 'added to' : 'removed from'} your favorites.`,
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Filter research items based on search query and filters
  const filteredItems = researchItems?.filter(item => {
    // Search query filter
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Source type filter
    const matchesSource = sourceFilter === "all" || item.sourceType === sourceFilter;
    
    // Evidence level filter
    const matchesEvidence = evidenceFilter === "all" || item.evidenceLevel === evidenceFilter;
    
    return matchesSearch && matchesSource && matchesEvidence;
  });
  
  // Group research items by source type and favorite status
  const favoriteItems = filteredItems?.filter(item => item.isFavorite === true);
  const treatmentItems = filteredItems?.filter(item => item.sourceType === 'treatment');
  const clinicalTrialItems = filteredItems?.filter(item => item.sourceType === 'clinical_trial');
  const literatureItems = filteredItems?.filter(item => 
    item.sourceType === 'pubmed' || item.sourceType === 'book' || item.sourceType === 'journal'
  );
  
  // Toggle favorite handler
  const handleToggleFavorite = (id: number) => {
    toggleFavoriteMutation.mutate(id);
  };
  
  // Helper function for item icons
  const getItemIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'treatment':
        return <FlaskRound className="h-5 w-5 text-blue-500" />;
      case 'clinical_trial':
        return <FlaskConical className="h-5 w-5 text-green-500" />;
      case 'book':
      case 'pubmed':
      case 'journal':
        return <BookOpen className="h-5 w-5 text-amber-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Saved Research</h1>
        </div>
      
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search saved research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="treatment">Treatments</SelectItem>
                <SelectItem value="clinical_trial">Clinical Trials</SelectItem>
                <SelectItem value="pubmed">PubMed</SelectItem>
                <SelectItem value="book">Books</SelectItem>
                <SelectItem value="journal">Journals</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={evidenceFilter} onValueChange={setEvidenceFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Evidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Evidence</SelectItem>
                <SelectItem value="high">High Evidence</SelectItem>
                <SelectItem value="medium">Medium Evidence</SelectItem>
                <SelectItem value="low">Low Evidence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Research items display */}
        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading your research...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading research items. Please try again.</p>
          </div>
        ) : filteredItems?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No saved research found</p>
            <p className="text-sm mt-2">Start a chat with the Research Assistant to gather information.</p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Research</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="trials">Clinical Trials</TabsTrigger>
              <TabsTrigger value="literature">Literature</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems?.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 py-3 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        {getItemIcon(item.sourceType)}
                        <CardTitle className="text-base">{item.title}</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleFavorite(item.id)}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Star 
                          className={`h-5 w-5 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm line-clamp-3">{item.content}</p>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {new Date(item.dateAdded).toLocaleDateString()}
                        </span>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="favorites" className="space-y-6">
              {favoriteItems?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No favorites yet</p>
                  <p className="text-sm mt-2">Mark items as favorites to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteItems?.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 py-3 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          {getItemIcon(item.sourceType)}
                          <CardTitle className="text-base">{item.title}</CardTitle>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleFavorite(item.id)}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm line-clamp-3">{item.content}</p>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            {new Date(item.dateAdded).toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="treatments" className="space-y-6">
              {treatmentItems?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No treatment research saved.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {treatmentItems?.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 py-3 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          <FlaskRound className="h-5 w-5 text-blue-500" />
                          <CardTitle className="text-base">{item.title}</CardTitle>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleFavorite(item.id)}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Star 
                            className={`h-5 w-5 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm line-clamp-3">{item.content}</p>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            {new Date(item.dateAdded).toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trials" className="space-y-6">
              {clinicalTrialItems?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No clinical trial research saved.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clinicalTrialItems?.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 py-3 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-5 w-5 text-green-500" />
                          <CardTitle className="text-base">{item.title}</CardTitle>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleFavorite(item.id)}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Star 
                            className={`h-5 w-5 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm line-clamp-3">{item.content}</p>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            {new Date(item.dateAdded).toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="literature" className="space-y-6">
              {literatureItems?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No literature research saved.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {literatureItems?.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 py-3 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-amber-500" />
                          <CardTitle className="text-base">{item.title}</CardTitle>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleFavorite(item.id)}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Star 
                            className={`h-5 w-5 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm line-clamp-3">{item.content}</p>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            {new Date(item.dateAdded).toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
