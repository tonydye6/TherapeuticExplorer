import { cn } from "@/lib/utils";

type ResearchSummaryCardProps = {
  text: string;
  sources: string[];
  evidenceLevel?: "high" | "medium" | "low";
  className?: string;
};

export default function ResearchSummaryCard({ 
  text, 
  sources, 
  evidenceLevel = "high",
  className 
}: ResearchSummaryCardProps) {
  // Process text to add medical term styling
  const processedText = text.replace(
    /\b([A-Z]{2,}(?:-[A-Z0-9]+)?|\w+(?:-\w+)+(?:omab|tinib|ciclib|rafenib|mab|nib))\b/g,
    '<span class="medical-term">$1</span>'
  );
  
  // Split paragraphs
  const paragraphs = processedText.split('\n\n');
  
  // Get border class based on evidence level
  const getBorderClass = () => {
    switch (evidenceLevel) {
      case "high":
        return "evidence-high";
      case "medium":
        return "evidence-medium";
      case "low":
        return "evidence-low";
      default:
        return "";
    }
  };
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden shadow-sm",
      getBorderClass(),
      className
    )}>
      <div className="p-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: paragraph }} />
        ))}
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            <strong>Sources:</strong> {sources.join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
}
