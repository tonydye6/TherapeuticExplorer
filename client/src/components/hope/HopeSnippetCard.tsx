import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteIcon, EditIcon, Trash2Icon } from 'lucide-react';
import { format } from 'date-fns';

type HopeSnippet = {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string | null;
  source: string | null;
  tags: string[] | null;
  isActive: boolean;
  createdAt: Date;
};

interface HopeSnippetCardProps {
  snippet: HopeSnippet;
  onEdit?: (snippet: HopeSnippet) => void;
  onDelete?: (id: number) => void;
  isCompact?: boolean;
}

export function HopeSnippetCard({ snippet, onEdit, onDelete, isCompact = false }: HopeSnippetCardProps) {
  return (
    <Card className={`h-full flex flex-col ${isCompact ? 'hover:shadow-md transition-shadow' : 'shadow-md'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-md md:text-xl flex-1">
            <QuoteIcon className="h-5 w-5 inline-block mr-2 text-primary opacity-80" />
            {snippet.title}
          </CardTitle>
          {!isCompact && (
            <Badge variant="outline" className="ml-2">
              {snippet.category}
            </Badge>
          )}
        </div>
        {!isCompact && snippet.author && (
          <CardDescription>- {snippet.author}{snippet.source ? `, ${snippet.source}` : ''}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="whitespace-pre-wrap text-sm md:text-base">
          {snippet.content}
        </div>
        
        {!isCompact && snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {snippet.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      {(onEdit || onDelete || !isCompact) && (
        <CardFooter className="pt-4 flex justify-between items-center mt-auto">
          {!isCompact && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(snippet.createdAt), 'MMM d, yyyy')}
            </span>
          )}
          
          <div className="flex gap-2 ml-auto">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(snippet)}
                className="h-8 w-8 p-0"
              >
                <EditIcon className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(snippet.id)}
                className="h-8 w-8 p-0 text-destructive"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
