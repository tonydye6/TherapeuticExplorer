import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { NeoCard, NeoCardHeader, NeoCardContent, NeoCardTitle, NeoCardDescription, NeoCardFooter, NeoCardDecoration } from "@/components/ui/neo-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NeoButton } from "@/components/ui/neo-button";
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
    <NeoCard className="h-full flex flex-col">
      <NeoCardDecoration />
      <NeoCardHeader>
        <div className="flex justify-between items-start">
          <NeoCardTitle>{story.title}</NeoCardTitle>
          {story.featured && (
            <Badge className="bg-white text-sophera-text-heading border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_#05060f] font-bold">
              FEATURED
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Avatar className="h-8 w-8 border-2 border-sophera-text-heading">
            <AvatarImage src={story.authorAvatar} />
            <AvatarFallback className="bg-sophera-gradient-start text-sophera-brand-primary font-bold">{story.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-sophera-text-body">{story.authorName} · {new Date(story.datePosted).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </NeoCardHeader>
      <NeoCardContent>
        <p className="text-base line-clamp-4 text-sophera-text-body">{story.content}</p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {story.tags.slice(0, 3).map(tag => (
            <Badge key={tag} className="text-xs px-2.5 py-1 bg-white text-sophera-text-heading border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_#05060f] font-bold">
              {tag}
            </Badge>
          ))}
          {story.tags.length > 3 && <span className="text-xs text-sophera-text-subtle">+{story.tags.length - 3} more</span>}
        </div>
      </NeoCardContent>
      <NeoCardFooter className="border-t-2 border-dashed border-sophera-text-heading pt-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <ThumbsUpIcon className="h-4 w-4 text-sophera-accent-tertiary" />
              {story.likesCount}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquareIcon className="h-4 w-4 text-sophera-accent-secondary" />
              {story.commentsCount}
            </span>
          </div>
          <div className="flex gap-3">
            <NeoButton 
              buttonText="Save" 
              size="sm" 
              icon={<BookmarkIcon className="h-4 w-4" />}
              color="pink"
            />
            <NeoButton 
              buttonText="Like" 
              size="sm" 
              icon={<HeartIcon className="h-4 w-4" />}
              color="primary"
            />
          </div>
        </div>
      </NeoCardFooter>
    </NeoCard>
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
    <div className={`space-y-8 ${!inTabView ? 'container py-8 md:py-10' : ''}`}>
      {!inTabView && (
        <div className="mb-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-sophera-text-heading mb-2">
            Survivor Stories
          </h1>
          <p className="text-lg text-sophera-text-body">
            Read inspiring stories from others on similar journeys and share your own experiences.
          </p>
        </div>
      )}
      
      {/* Search and filters */}
      <NeoCard className="h-auto">
        <NeoCardHeader>
          <NeoCardTitle>FIND STORIES</NeoCardTitle>
        </NeoCardHeader>
        <NeoCardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sophera-text-subtle" />
              <Input 
                placeholder="Search stories..." 
                className="pl-10 h-12 border-3 border-sophera-text-heading rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 border-3 border-sophera-text-heading rounded-lg">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category} className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 border-3 border-sophera-text-heading rounded-lg">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent className="border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
                  <SelectItem value="All" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">All Tags</SelectItem>
                  {TAGS.map(tag => (
                    <SelectItem key={tag} value={tag} className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </NeoCardContent>
      </NeoCard>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <NeoCard key={i} className="h-[320px]">
              <NeoCardHeader>
                <Skeleton className="h-6 w-2/3 mb-2 bg-sophera-gradient-start/30 rounded-md" />
                <Skeleton className="h-4 w-1/3 bg-sophera-gradient-start/20 rounded-md" />
              </NeoCardHeader>
              <NeoCardContent>
                <Skeleton className="h-4 w-full mb-2 bg-sophera-gradient-start/20 rounded-md" />
                <Skeleton className="h-4 w-full mb-2 bg-sophera-gradient-start/20 rounded-md" />
                <Skeleton className="h-4 w-3/4 mb-4 bg-sophera-gradient-start/20 rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 bg-sophera-gradient-start/30 rounded-full" />
                  <Skeleton className="h-6 w-16 bg-sophera-gradient-start/30 rounded-full" />
                </div>
              </NeoCardContent>
            </NeoCard>
          ))}
        </div>
      ) : filteredStories?.length === 0 ? (
        <NeoCard className="h-auto">
          <NeoCardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-sophera-gradient-start/20 flex items-center justify-center mb-1">
                <SearchIcon className="h-7 w-7 text-sophera-brand-primary" />
              </div>
              <h3 className="text-xl font-extrabold text-sophera-text-heading">NO STORIES FOUND</h3>
              <p className="text-sophera-text-body mt-2 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'All Stories' || selectedTag !== 'All'
                  ? "No stories found matching your search criteria. Try adjusting your filters."
                  : "There are no stories yet. Be the first to share your experience."}
              </p>
              <NeoButton 
                buttonText="Clear Filters"
                color="primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Stories');
                  setSelectedTag('All');
                }}
                className="mt-4"
              />
            </div>
          </NeoCardContent>
        </NeoCard>
      ) : (
        <>
          {/* Featured stories section */}
          {featuredStories && featuredStories.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-sophera-text-heading">FEATURED STORIES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredStories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </div>
          )}
          
          {/* Recent stories section */}
          {otherStories && otherStories.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-sophera-text-heading">RECENT STORIES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherStories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </div>
          )}
          
          {/* Share your story button - at the bottom */}
          <div className="flex justify-center mt-8">
            <NeoButton 
              buttonText="Share Your Story" 
              color="primary" 
              size="lg"
            />
          </div>
        </>
      )}
    </div>
  );
}