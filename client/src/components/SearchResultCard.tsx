import { ResearchItem } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, FileTextIcon, BookOpenIcon, FlaskConicalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface SearchResultCardProps {
  result: ResearchItem;
  onView: (item: ResearchItem) => void;
}

export function SearchResultCard({ result, onView }: SearchResultCardProps) {
  const getSourceIcon = () => {
    switch (result.sourceType) {
      case "pubmed":
        return <FileTextIcon className="h-4 w-4 mr-1" />;
      case "book":
        return <BookOpenIcon className="h-4 w-4 mr-1" />;
      case "clinical_trial":
        return <FlaskConicalIcon className="h-4 w-4 mr-1" />;
      case "document":
      case "document_analysis":
        return <FileTextIcon className="h-4 w-4 mr-1" />;
      default:
        return <FileTextIcon className="h-4 w-4 mr-1" />;
    }
  };

  const getEvidenceLevelColor = () => {
    switch (result.evidenceLevel) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  // Truncate content to a reasonable length for preview
  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Card className="mb-4 transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{result.title}</CardTitle>
          <div className="flex items-center space-x-2">
            {result.evidenceLevel && (
              <Badge variant="outline" className={getEvidenceLevelColor()}>
                {result.evidenceLevel} evidence
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="flex items-center mt-1 text-sm text-gray-500">
          <div className="flex items-center mr-3">
            {getSourceIcon()}
            <span className="capitalize">{result.sourceType.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{formatDate(result.dateAdded.toString())}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700">{truncateContent(result.content)}</p>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        <Button
          variant="ghost" 
          size="sm"
          onClick={() => onView(result)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}