import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SparklesIcon, RefreshCwIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

type HopeSnippetType = {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string | null;
  source: string | null;
};

export function HopeSnippet() {
  const {
    data: snippet,
    isLoading,
    error,
    refetch
  } = useQuery<HopeSnippetType>({
    queryKey: ["/api/hope-snippets/random"],
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center py-4 text-gray-500">
            <SparklesIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Could not load hope snippet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary-100">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <SparklesIcon className="h-6 w-6 text-primary-400 mb-4" />
          
          {isLoading ? (
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          ) : snippet ? (
            <>
              <h3 className="text-lg font-medium mb-3 text-primary-800">{snippet.title}</h3>
              <p className="text-gray-700 mb-2 italic">"{snippet.content}"</p>
              {snippet.author && (
                <p className="text-sm text-gray-500">
                  — {snippet.author}
                  {snippet.source && `, ${snippet.source}`}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-2 text-gray-500">
              <p>No hope snippets available.</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="justify-center pt-0 pb-6">
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-primary-600"
            onClick={handleRefresh}
          >
            <RefreshCwIcon className="h-4 w-4 mr-1" />
            New Quote
          </Button>
          <Link href="/connect-hope">
            <Button variant="outline" size="sm">
              More Hope
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
