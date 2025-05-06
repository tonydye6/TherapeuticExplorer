import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchIcon, FilterIcon, HeartIcon, BookmarkIcon, ThumbsUpIcon, MessageSquareIcon } from 'lucide-react';

interface SurvivorStoriesPageProps {
  inTabView?: boolean;
}

// Sample categories for stories
const CATEGORIES = [
  "All Stories",
  "Newly Diagnosed",
  "In Treatment",
  "Post-Treatment",
  "Caregivers",
  "Long-Term Survivors",
  "Clinical Trials",
  "Alternative Therapies"
];

// Sample tags for filtering
const TAGS = [
  "Esophageal Cancer",
  "Chemotherapy",
  "Radiation",
  "Surgery",
  "Nutrition",
  "Mindfulness",
  "Hope",
  "Family Support",
  "Side Effects",
  "Recovery"
];

// Sample data structure for stories
interface Story {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  datePosted: string;
  category: string;
  tags: string[];
  featured?: boolean;
  likesCount: number;
  commentsCount: number;
  journey?: {
    diagnosisDate: string;
    stage: string;
    treatments: string[];
    currentStatus: string;
  };
}

// Sample featured stories
const FEATURED_STORIES: Story[] = [
  {
    id: 1,
    title: "Finding Strength in Unexpected Places",
    content: "When I was diagnosed with esophageal cancer last year, I never imagined the journey would transform me in so many ways. Through the challenges of treatment, I discovered inner resources I never knew I had. The support from my healthcare team and loved ones made all the difference. Today, I'm recovering well and appreciating each day in a new way.",
    authorName: "Sarah J.",
    datePosted: "2025-01-15",
    category: "Post-Treatment",
    tags: ["Esophageal Cancer", "Recovery", "Hope"],
    featured: true,
    likesCount: 42,
    commentsCount: 7,
    journey: {
      diagnosisDate: "2024-01-10",
      stage: "Stage 2",
      treatments: ["Surgery", "Chemotherapy"],
      currentStatus: "In remission"
    }
  },
  {
    id: 2,
    title: "Supporting My Partner Through Treatment",
    content: "As a caregiver to my husband during his esophageal cancer journey, I learned the importance of self-care alongside patient care. Finding a community of other caregivers provided essential support and practical advice that helped us navigate the medical system more effectively. I'm sharing our story to help others feel less alone in this challenging role.",
    authorName: "Michael T.",
    datePosted: "2025-02-03",
    category: "Caregivers",
    tags: ["Family Support", "Caregiving", "Esophageal Cancer"],
    featured: true,
    likesCount: 38,
    commentsCount: 12
  },
  {
    id: 3,
    title: "My Clinical Trial Experience",
    content: "Participating in a clinical trial for advanced esophageal cancer gave me access to innovative treatment when standard approaches weren't working. The process was different than I expected - more structured, with excellent care and monitoring. While there were challenges, I'm grateful for the opportunity and want to share what I learned about navigating clinical trials.",
    authorName: "Robert K.",
    datePosted: "2025-03-10",
    category: "Clinical Trials",
    tags: ["Clinical Trials", "Advanced Cancer", "Treatment Options"],
    featured: true,
    likesCount: 29,
    commentsCount: 8,
    journey: {
      diagnosisDate: "2023-09-12",
      stage: "Stage 3",
      treatments: ["Chemotherapy", "Immunotherapy Trial"],
      currentStatus: "Stable disease"
    }
  }
];

// Sample recent stories
const RECENT_STORIES: Story[] = [
  {
    id: 4,
    title: "Nutrition After Esophagectomy",
    content: "Managing nutrition after my esophagectomy was one of my biggest challenges. I'm sharing what worked for me and the resources that helped.",
    authorName: "Lisa M.",
    datePosted: "2025-04-02",
    category: "Post-Treatment",
    tags: ["Nutrition", "Surgery", "Recovery"],
    likesCount: 23,
    commentsCount: 5
  },
  {
    id: 5,
    title: "Mindfulness Practices During Chemo",
    content: "These mindfulness techniques helped me cope with anxiety and side effects during my chemotherapy treatment.",
    authorName: "David W.",
    datePosted: "2025-03-28",
    category: "In Treatment",
    tags: ["Chemotherapy", "Mindfulness", "Side Effects"],
    likesCount: 18,
    commentsCount: 3
  },
  {
    id: 6,
    title: "Five Years Cancer-Free",
    content: "Reflecting on my five-year milestone and how my perspective on life has changed since my diagnosis.",
    authorName: "Jennifer P.",
    datePosted: "2025-03-25",
    category: "Long-Term Survivors",
    tags: ["Hope", "Recovery", "Survivorship"],
    likesCount: 45,
    commentsCount: 9
  },
  {
    id: 7,
    title: "First Steps After Diagnosis",
    content: "Recently diagnosed and sharing what I've learned about gathering information, finding the right care team, and preparing for treatment.",
    authorName: "Thomas H.",
    datePosted: "2025-03-22",
    category: "Newly Diagnosed",
    tags: ["Newly Diagnosed", "Esophageal Cancer"],
    likesCount: 12,
    commentsCount: 6
  }
];

// Combined stories
const ALL_STORIES = [...FEATURED_STORIES, ...RECENT_STORIES];

const StoryCard = ({ story }: { story: Story }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">{story.title}</CardTitle>
          {story.featured && <Badge variant="secondary">Featured</Badge>}
        </div>
        <CardDescription className="flex items-center gap-2 pt-1">
          <Avatar className="h-6 w-6">
            <AvatarImage src={story.authorAvatar} />
            <AvatarFallback>{story.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs">{story.authorName} · {new Date(story.datePosted).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-4 text-muted-foreground">{story.content}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {story.tags.slice(0, 3).map(tag => (
            <Badge variant="outline" key={tag} className="text-xs bg-primary/5">
              {tag}
            </Badge>
          ))}
          {story.tags.length > 3 && <span className="text-xs text-muted-foreground">+{story.tags.length - 3} more</span>}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ThumbsUpIcon className="h-3.5 w-3.5" />
            {story.likesCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquareIcon className="h-3.5 w-3.5" />
            {story.commentsCount}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <BookmarkIcon className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <HeartIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function SurvivorStoriesPage({ inTabView }: SurvivorStoriesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Stories');
  const [selectedTag, setSelectedTag] = useState('All');
  
  // In a real implementation, this would fetch from the backend
  const { data: stories, isLoading } = useQuery({
    queryKey: ["/api/survivor-stories"],
    // This is a placeholder since we're using static data
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return ALL_STORIES;
    },
    refetchOnWindowFocus: false,
  });

  // Filter stories based on search term, category, and tags
  const filteredStories = stories?.filter(story => {
    const matchesSearch = searchTerm
      ? story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategory === 'All Stories'
      ? true
      : story.category === selectedCategory;
    
    const matchesTags = selectedTag === 'All'
      ? true
      : story.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  // Get featured stories
  const featuredStories = filteredStories?.filter(story => story.featured);
  
  // Get non-featured stories
  const otherStories = filteredStories?.filter(story => !story.featured);

  return (
    <div className={`space-y-6 ${!inTabView ? 'container py-6' : ''}`}>
      {!inTabView && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Survivor Stories</h1>
          <p className="text-muted-foreground">
            Read inspiring stories from others on similar journeys and share your own.
          </p>
        </div>
      )}
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search stories..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Tags</SelectItem>
              {TAGS.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[280px]">
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
      ) : filteredStories?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            No stories found matching your search criteria.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setSelectedCategory('All Stories');
            setSelectedTag('All');
          }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          {/* Featured stories */}
          {featuredStories && featuredStories.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Featured Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredStories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </div>
          )}
          
          {/* Recent stories */}
          {otherStories && otherStories.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Community Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherStories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-center pt-4">
            <Button className="mr-2">
              Share Your Story
            </Button>
            <Button variant="outline">
              Browse All Stories
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
