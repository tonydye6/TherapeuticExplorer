import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon, ExternalLinkIcon, BookmarkIcon, StarIcon, HeartIcon } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResourceHubPageProps {
  inTabView?: boolean;
}

// Resource categories
const RESOURCE_CATEGORIES = [
  "Financial Support",
  "Advocacy & Support Groups",
  "Nutrition Resources",
  "Mental Health",
  "Medical Equipment",
  "Transportation",
  "Legal Resources"
];

// Resource interface
interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  phoneNumber?: string;
  isVerified: boolean;
  rating: number; // 1-5
  logoUrl?: string;
}

// Sample resource data
const RESOURCES: Resource[] = [
  {
    id: 1,
    title: "Cancer Financial Assistance Coalition",
    description: "A coalition of financial assistance organizations helping cancer patients manage costs during treatment.",
    url: "https://www.cancerfac.org",
    category: "Financial Support",
    tags: ["Financial Aid", "Cost Management", "Treatment Expenses"],
    isVerified: true,
    rating: 5
  },
  {
    id: 2,
    title: "Esophageal Cancer Support Network",
    description: "Connecting patients and families with others who understand esophageal cancer for emotional and practical support.",
    url: "https://ecaware.org",
    category: "Advocacy & Support Groups",
    tags: ["Peer Support", "Community", "Esophageal Cancer"],
    phoneNumber: "1-800-555-1234",
    isVerified: true,
    rating: 5
  },
  {
    id: 3,
    title: "CancerCare",
    description: "Professional support services for cancer patients, including counseling, support groups, education, and financial assistance.",
    url: "https://www.cancercare.org",
    category: "Mental Health",
    tags: ["Counseling", "Support Groups", "Education", "Financial Aid"],
    phoneNumber: "1-800-813-4673",
    isVerified: true,
    rating: 5
  },
  {
    id: 4,
    title: "Patient Advocate Foundation",
    description: "Case management services and financial aid for patients with chronic, life-threatening and debilitating diseases.",
    url: "https://www.patientadvocate.org",
    category: "Legal Resources",
    tags: ["Patient Rights", "Insurance Issues", "Medical Debt"],
    phoneNumber: "1-800-532-5274",
    isVerified: true,
    rating: 4
  },
  {
    id: 5,
    title: "American Cancer Society Road To Recovery",
    description: "Transportation assistance program providing rides to cancer-related medical appointments.",
    url: "https://www.cancer.org/support-programs-and-services/road-to-recovery.html",
    category: "Transportation",
    tags: ["Transportation", "Medical Appointments"],
    phoneNumber: "1-800-227-2345",
    isVerified: true,
    rating: 4
  },
  {
    id: 6,
    title: "Cancer Nutrition Resources",
    description: "Resources for managing nutrition during and after cancer treatment, including expert advice and recipes.",
    url: "https://www.aicr.org/cancer-survival/treatment-tips/during-treatment/",
    category: "Nutrition Resources",
    tags: ["Nutrition", "Diet", "Recipes", "Expert Advice"],
    isVerified: true,
    rating: 4
  },
  {
    id: 7,
    title: "NeedyMeds",
    description: "Information on programs that help patients who can't afford medications and healthcare costs.",
    url: "https://www.needymeds.org",
    category: "Financial Support",
    tags: ["Medication Assistance", "Healthcare Costs"],
    phoneNumber: "1-800-503-6897",
    isVerified: true,
    rating: 4
  },
  {
    id: 8,
    title: "Cancer Legal Resource Center",
    description: "Free information and resources on cancer-related legal issues to cancer survivors, caregivers, and healthcare professionals.",
    url: "https://thedrlc.org/cancer/",
    category: "Legal Resources",
    tags: ["Legal Assistance", "Employment Rights", "Insurance"],
    phoneNumber: "1-866-843-2572",
    isVerified: true,
    rating: 5
  },
  {
    id: 9,
    title: "Cancer and Careers",
    description: "Helping cancer patients and survivors navigate employment challenges and thrive in the workplace.",
    url: "https://www.cancerandcareers.org",
    category: "Legal Resources",
    tags: ["Employment", "Career", "Workplace Rights"],
    isVerified: true,
    rating: 4
  },
  {
    id: 10,
    title: "Triage Cancer",
    description: "National nonprofit organization providing free education on the legal and practical issues that may impact individuals diagnosed with cancer.",
    url: "https://triagecancer.org",
    category: "Legal Resources",
    tags: ["Legal", "Insurance", "Employment", "Education"],
    isVerified: true,
    rating: 4
  },
  {
    id: 11,
    title: "Healthcare Equipment Loan Program (HELP)",
    description: "Providing free loans of home health equipment and supplies to those in need.",
    url: "https://www.helpmed.org",
    category: "Medical Equipment",
    tags: ["Medical Equipment", "Home Care"],
    phoneNumber: "1-800-555-4357",
    isVerified: false,
    rating: 3
  },
  {
    id: 12,
    title: "Mental Health America",
    description: "Resources for mental health screening, finding therapy, and help with depression and anxiety during cancer treatment.",
    url: "https://mhanational.org",
    category: "Mental Health",
    tags: ["Mental Health", "Depression", "Anxiety", "Therapy"],
    phoneNumber: "1-800-273-8255",
    isVerified: true,
    rating: 4
  }
];

// Resource card component
const ResourceCard = ({ resource }: { resource: Resource }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-1">
              {resource.title}
              {resource.isVerified && (
                <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                  Verified
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="pt-1">
              {resource.category}
            </CardDescription>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon 
                key={i} 
                className={`h-3.5 w-3.5 ${i < resource.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 text-muted-foreground">{resource.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {resource.tags.slice(0, 3).map(tag => (
            <Badge variant="outline" key={tag} className="text-xs bg-primary/5">
              {tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{resource.tags.length - 3} more</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between items-center">
        <div>
          {resource.phoneNumber && (
            <p className="text-xs text-muted-foreground">{resource.phoneNumber}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <BookmarkIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              <span>Visit</span>
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function ResourceHubPage({ inTabView }: ResourceHubPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // In a real implementation, this would fetch from the backend
  const { data: resources, isLoading } = useQuery({
    queryKey: ["/api/resources"],
    // This is a placeholder since we're using static data
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return RESOURCES;
    },
    refetchOnWindowFocus: false,
  });

  // Filter resources based on search term and selected category
  const filteredResources = resources?.filter(resource => {
    const matchesSearch = searchTerm
      ? resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    const matchesCategory = activeTab === 'all' || 
      activeTab === resource.category.toLowerCase().replace(/\s+/g, '-');
    
    return matchesSearch && matchesCategory;
  });

  const categorizedResources = RESOURCE_CATEGORIES.reduce((acc, category) => {
    const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
    acc[categoryKey] = filteredResources?.filter(r => r.category === category) || [];
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className={`space-y-6 ${!inTabView ? 'container py-6' : ''}`}>
      {!inTabView && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Hub</h1>
          <p className="text-muted-foreground">
            Find helpful resources for every aspect of your cancer journey.
          </p>
        </div>
      )}
      
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search for resources..." 
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ScrollArea className="w-full" orientation="horizontal">
          <TabsList className="w-full h-auto flex flex-nowrap py-2 px-1">
            <TabsTrigger value="all" className="flex-shrink-0">
              All Resources
            </TabsTrigger>
            {RESOURCE_CATEGORIES.map(category => (
              <TabsTrigger 
                key={category} 
                value={category.toLowerCase().replace(/\s+/g, '-')}
                className="flex-shrink-0"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-[250px]">
                <CardHeader>
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-4" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResources?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No resources found matching your search criteria.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setActiveTab('all');
            }}>
              Clear search
            </Button>
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources?.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </TabsContent>
            
            {RESOURCE_CATEGORIES.map(category => {
              const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
              const categoryResources = categorizedResources[categoryKey];
              
              return (
                <TabsContent key={categoryKey} value={categoryKey} className="mt-6">
                  {categoryResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground mb-4">
                        No {category.toLowerCase()} resources found matching your search.
                      </p>
                      <Button variant="outline" onClick={() => setSearchTerm('')}>
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryResources.map(resource => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </>
        )}
      </Tabs>

      {/* Action buttons */}
      <div className="flex justify-center pt-4">
        <Button className="mr-2">
          Suggest a Resource
        </Button>
        <Button variant="outline">
          Download Resource List
        </Button>
      </div>
    </div>
  );
}
