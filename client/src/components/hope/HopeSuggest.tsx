import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useHopeSnippets } from '@/hooks/use-hope-snippets';
import { HopeSnippetCard } from './HopeSnippetCard';

interface HopeSuggestProps {
  category?: string;
  showRefreshButton?: boolean;
  className?: string;
}

export function HopeSuggest({ category, showRefreshButton = true, className = '' }: HopeSuggestProps) {
  const { 
    randomSnippet, 
    isRandomLoading, 
    refetchRandom,
    setSelectedCategory
  } = useHopeSnippets();
  
  React.useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category, setSelectedCategory]);

  if (isRandomLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="pt-6 pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        {showRefreshButton && (
          <CardFooter className="pb-4 pt-0 flex justify-end">
            <Skeleton className="h-9 w-9 rounded-md" />
          </CardFooter>
        )}
      </Card>
    );
  }

  // If no snippet is found, show a message
  if (!randomSnippet) {
    return (
      <Card className={`${className}`}>
        <CardContent className="pt-6 pb-4">
          <p className="text-center text-muted-foreground py-4">
            No hope snippets found{category ? ` in category "${category}"` : ""}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <HopeSnippetCard snippet={randomSnippet} isCompact={true} />
      
      {showRefreshButton && (
        <div className="flex justify-end mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetchRandom()}
            className="h-8 w-8 p-0"
            title="Show another snippet"
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
