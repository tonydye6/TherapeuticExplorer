
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink, Bookmark, Star, Heart, BookOpen, Users, Building, Globe, PenSquare, Newspaper, Download, Link2, Filter } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock resource categories
const RESOURCE_CATEGORIES = [
  {
    id: "support-groups",
    name: "Support Groups",
    icon: <Users className="h-5 w-5 text-sophera-brand-primary" />,
    description: "Connect with others facing similar challenges"
  },
  {
    id: "organizations",
    name: "Organizations",
    icon: <Building className="h-5 w-5 text-sophera-accent-secondary" />,
    description: "Cancer research and advocacy organizations"
  },
  {
    id: "websites",
    name: "Websites",
    icon: <Globe className="h-5 w-5 text-sophera-brand-primary" />,
    description: "Reliable information sources and tools"
  },
  {
    id: "books",
    name: "Books",
    icon: <BookOpen className="h-5 w-5 text-sophera-accent-tertiary" />,
    description: "Recommended reading for patients and caregivers"
  },
  {
    id: "blogs",
    name: "Blogs & Personal Stories",
    icon: <PenSquare className="h-5 w-5 text-sophera-accent-secondary" />,
    description: "First-hand experiences and perspectives"
  },
  {
    id: "news",
    name: "News & Research",
    icon: <Newspaper className="h-5 w-5 text-sophera-brand-primary" />,
    description: "Latest developments in cancer research"
  }
];

// Mock resources
const MOCK_RESOURCES = [
  {
    id: 1,
    title: "Esophageal Cancer Awareness Association",
    description: "Nonprofit organization dedicated to increasing awareness about esophageal cancer, supporting patients, and funding research.",
    url: "https://www.ecaware.org",
    category: "organizations",
    rating: 4.9,
    reviewCount: 124,
    isFeatured: true,
    tags: ["support", "research", "community"]
  },
  {
    id: 2,
    title: "Esophageal Cancer Support Group",
    description: "Online community for patients, survivors, and caregivers affected by esophageal cancer to share experiences and support.",
    url: "https://www.cancerforums.net/forums/esophageal-cancer.78/",
    category: "support-groups",
    rating: 4.7,
    reviewCount: 89,
    isFeatured: true,
    tags: ["community", "online", "discussion"]
  },
  {
    id: 3,
    title: "MD Anderson Cancer Center - Esophageal Cancer",
    description: "Comprehensive information about esophageal cancer diagnosis, treatment options, and clinical trials from a leading cancer center.",
    url: "https://www.mdanderson.org/cancer-types/esophageal-cancer.html",
    category: "websites",
    rating: 4.8,
    reviewCount: 156,
    isFeatured: true,
    tags: ["medical", "treatment", "clinical trials"]
  },
  {
    id: 4,
    title: "The Middle of It: Surviving Esophageal Cancer",
    description: "Personal memoir by a stage IV esophageal cancer survivor sharing insights, challenges, and hope.",
    url: "https://www.amazon.com/example-surviving-esophageal-cancer",
    category: "books",
    rating: 4.6,
    reviewCount: 72,
    isFeatured: false,
    tags: ["memoir", "survivor", "inspiration"]
  },
  {
    id: 5,
    title: "Cancer.Net - Esophageal Cancer",
    description: "Doctor-approved patient information from the American Society of Clinical Oncology (ASCO).",
    url: "https://www.cancer.net/cancer-types/esophageal-cancer",
    category: "websites",
    rating: 4.7,
    reviewCount: 103,
    isFeatured: false,
    tags: ["medical", "education", "trusted"]
  },
  {
    id: 6,
    title: "Nutrition for Esophageal Cancer Patients",
    description: "Practical guide for managing nutrition challenges during and after esophageal cancer treatment.",
    url: "https://www.cancerresearchuk.org/about-cancer/esophageal-cancer/living-with/diet-problems",
    category: "websites",
    rating: 4.5,
    reviewCount: 68,
    isFeatured: false,
    tags: ["nutrition", "practical", "lifestyle"]
  }
];

interface ResourceHubPageProps {
  inTabView?: boolean;
}

export default function ResourceHubPage({ inTabView = false }: ResourceHubPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock API call for resources
  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/resources', selectedCategory, searchQuery],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter resources based on search and category
      return MOCK_RESOURCES.filter(resource => {
        const matchesSearch = searchQuery === "" || 
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = !selectedCategory || resource.category === selectedCategory;
        
        const matchesTab = activeTab === "all" || 
          (activeTab === "featured" && resource.isFeatured) ||
          (activeTab === "favorites" && resource.rating > 4.7);  // Mock for favorites
        
        return matchesSearch && matchesCategory && matchesTab;
      });
    }
  });

  // Filtered categories based on what has results
  const activeCategories = resources 
    ? Array.from(new Set(resources.map(r => r.category)))
    : [];

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleSaveResource = (resourceId: number) => {
    // Implementation would save to user's account
    console.log("Saving resource:", resourceId);
    toast({
      title: "Resource saved",
      description: "This resource has been saved to your favorites.",
    });
  };

  // Handle PDF downloads for different resource types
  const handleDownloadPDF = (resourceType: string) => {
    // In a production app, this would fetch the actual PDF from the server
    // For now, we'll simulate a download with a toast notification
    toast({
      title: `${resourceType} Downloaded`,
      description: "Your PDF has been downloaded successfully.",
    });
    
    // In a real implementation, we would trigger the download like this:
    // const link = document.createElement('a');
    // link.href = `/api/resources/download/${resourceType.toLowerCase().replace(/\s+/g, '-')}`;
    // link.download = `${resourceType}.pdf`;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  };

  // Handle resource suggestion
  const handleSuggestResource = (event: React.FormEvent) => {
    event.preventDefault();
    setIsResourceDialogOpen(false);
    toast({
      title: "Resource suggestion received",
      description: "Thank you for your contribution! Our team will review your suggestion."
    });
  };

  return (
    <div className={`${inTabView ? "" : "container py-8 md:py-10"} max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`}>
      <div className="flex flex-col gap-6 md:gap-8">
        {!inTabView && (
          <div>
            <h1 className="text-3xl font-extrabold text-sophera-text-heading">Resource Hub</h1>
            <p className="text-sophera-text-body text-lg mt-2">
              Discover trusted resources, support communities, and educational materials for your journey
            </p>
          </div>
        )}
        
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sophera-text-subtle" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-sophera-input border-sophera-border-primary focus:border-sophera-brand-primary"
            />
          </div>
          
          <div className="flex gap-3 items-center">
            <Select value={selectedCategory || "all-categories"} onValueChange={(value) => handleCategoryChange(value === "all-categories" ? null : value)}>
              <SelectTrigger className="w-[180px] rounded-sophera-input border-sophera-border-primary">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-sophera-brand-primary" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-sophera-input border-sophera-border-primary">
                <SelectItem value="all-categories">All Categories</SelectItem>
                {RESOURCE_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              className="border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary-dark rounded-sophera-button hidden md:flex"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        {/* Category Cards - Desktop Only */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {RESOURCE_CATEGORIES.map(category => (
            <Card 
              key={category.id}
              className={`cursor-pointer hover:shadow-md transition-shadow border-sophera-border-primary rounded-sophera-card bg-sophera-bg-card ${
                selectedCategory === category.id ? 'border-sophera-brand-primary bg-sophera-brand-primary-light/20' : ''
              }`}
              onClick={() => handleCategoryChange(selectedCategory === category.id ? null : category.id)}
            >
              <CardContent className="p-4 md:p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedCategory === category.id ? 'bg-sophera-brand-primary/20' : 'bg-sophera-gradient-start'
                }`}>
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sophera-text-heading">{category.name}</h3>
                  <p className="text-xs text-sophera-text-subtle mt-1">{category.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Tabs and Resources */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 p-1.5 bg-sophera-gradient-start rounded-sophera-button gap-1.5 grid grid-cols-3">
              <TabsTrigger 
                value="all" 
                className="flex items-center gap-2 text-sm md:text-base rounded-sophera-input h-11 data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md"
              >
                All Resources
              </TabsTrigger>
              <TabsTrigger 
                value="featured" 
                className="flex items-center gap-2 text-sm md:text-base rounded-sophera-input h-11 data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md"
              >
                <Star className="h-4 w-4" />
                Featured
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="flex items-center gap-2 text-sm md:text-base rounded-sophera-input h-11 data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md"
              >
                <Heart className="h-4 w-4" />
                My Favorites
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-sophera-text-heading">
                {activeTab === "all" ? "All Resources" : 
                 activeTab === "featured" ? "Featured Resources" : 
                 "My Favorites"}
                {selectedCategory && (
                  <span className="font-normal text-sophera-text-subtle text-lg ml-2">
                    • {RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
              </h2>
              
              {(searchQuery || selectedCategory) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary-dark rounded-sophera-button md:hidden"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="rounded-sophera-card border-sophera-border-primary bg-sophera-bg-card shadow-sm">
                    <CardHeader className="pb-4">
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent className="pb-4">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6 mb-2" />
                      <Skeleton className="h-4 w-4/6" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-24 mr-2" />
                      <Skeleton className="h-9 w-32" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : resources && resources.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {resources.map(resource => (
                  <Card 
                    key={resource.id} 
                    className="rounded-sophera-card border-sophera-border-primary bg-sophera-bg-card shadow-md hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-xl text-sophera-text-heading">{resource.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge className="bg-sophera-gradient-start text-sophera-brand-primary border-sophera-border-subtle rounded-full px-2.5 py-0.5">
                              {RESOURCE_CATEGORIES.find(c => c.id === resource.category)?.name}
                            </Badge>
                            {resource.isFeatured && (
                              <Badge className="bg-sophera-accent-tertiary/20 text-sophera-accent-tertiary border-sophera-border-subtle rounded-full px-2.5 py-0.5">
                                <Star className="h-3 w-3 mr-1" fill="currentColor" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sophera-text-subtle text-sm mr-1">{resource.rating}</span>
                          <Star className="h-4 w-4 text-sophera-accent-tertiary" fill="currentColor" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sophera-text-body">{resource.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {resource.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs text-sophera-text-subtle border-sophera-border-subtle rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 border-t border-sophera-border-subtle flex justify-between">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary-dark rounded-sophera-button"
                        onClick={() => handleSaveResource(resource.id)}
                      >
                        <Bookmark className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-sophera-brand-primary hover:bg-sophera-brand-primary-dark text-white rounded-sophera-button shadow-sm"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit Resource
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 md:p-12 text-center rounded-sophera-card border-sophera-border-primary bg-sophera-bg-card shadow-sm">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <Search className="h-12 w-12 text-sophera-text-subtle mb-4" />
                  <h3 className="text-xl font-semibold text-sophera-text-heading mb-2">No resources found</h3>
                  <p className="text-sophera-text-body mb-6">
                    {searchQuery 
                      ? `No resources match "${searchQuery}"${selectedCategory ? ' in this category' : ''}.` 
                      : selectedCategory 
                        ? "No resources found in this category." 
                        : "No resources are currently available."}
                  </p>
                  <Button
                    variant="outline"
                    className="border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary-dark rounded-sophera-button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </Card>
            )}
          </Tabs>
        </div>
        
        {/* Download Resources Section */}
        <Card className="mt-8 md:mt-10 rounded-sophera-card bg-sophera-gradient-start/30 border-sophera-brand-primary/20 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-sophera-text-heading">Downloadable Resources</CardTitle>
            <CardDescription className="text-sophera-text-subtle pt-1">
              Helpful materials you can download and share with your healthcare team or loved ones.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="rounded-sophera-card border-sophera-border-primary bg-sophera-bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-5 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-sophera-brand-primary/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-sophera-brand-primary" />
                  </div>
                  <h3 className="font-medium text-sophera-text-heading">Doctor Discussion Guide</h3>
                </div>
                <p className="text-sm text-sophera-text-body mb-4 flex-grow">
                  A printable guide with questions to ask your doctor about esophageal cancer treatment options.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full justify-center border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary-dark rounded-sophera-button"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
            
            <Card className="rounded-sophera-card border-sophera-border-primary bg-sophera-bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-5 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-sophera-accent-secondary/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-sophera-accent-secondary" />
                  </div>
                  <h3 className="font-medium text-sophera-text-heading">Treatment Tracker</h3>
                </div>
                <p className="text-sm text-sophera-text-body mb-4 flex-grow">
                  A printable calendar to track appointments, medications, and symptoms throughout your treatment.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full justify-center border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary-dark rounded-sophera-button"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
            
            <Card className="rounded-sophera-card border-sophera-border-primary bg-sophera-bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-5 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-sophera-accent-tertiary/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-sophera-accent-tertiary" />
                  </div>
                  <h3 className="font-medium text-sophera-text-heading">Nutrition Guide</h3>
                </div>
                <p className="text-sm text-sophera-text-body mb-4 flex-grow">
                  Helpful nutrition tips and recipes specially designed for esophageal cancer patients.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full justify-center border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary-dark rounded-sophera-button"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        
        {/* Additional Resources Section */}
        <div className="mt-4 md:mt-6">
          <h2 className="text-xl font-semibold text-sophera-text-heading mb-4">Additional Resources</h2>
          <p className="text-sophera-text-body mb-6">
            Can't find what you're looking for? Try these options:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="rounded-sophera-card border-sophera-border-primary bg-sophera-bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-sophera-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <Search className="h-6 w-6 text-sophera-brand-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sophera-text-heading mb-1">Ask the AI Research Assistant</h3>
                  <p className="text-sm text-sophera-text-body">
                    Use our AI to search medical literature and find specific information about your condition.
                  </p>
                  <Button 
                    className="mt-3 bg-sophera-brand-primary hover:bg-sophera-brand-primary-dark text-white rounded-sophera-button shadow-sm"
                    size="sm"
                  >
                    Go to Research Assistant
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-sophera-card border-sophera-border-primary bg-sophera-bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-sophera-accent-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Link2 className="h-6 w-6 text-sophera-accent-secondary" />
                </div>
                <div>
                  <h3 className="font-medium text-sophera-text-heading mb-1">Suggest a Resource</h3>
                  <p className="text-sm text-sophera-text-body">
                    Know a helpful resource that's not listed here? Submit it for our review.
                  </p>
                  <Button 
                    variant="outline"
                    className="mt-3 border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary-dark rounded-sophera-button"
                    size="sm"
                  >
                    Suggest Resource
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
