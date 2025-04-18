import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ExternalLink 
} from "lucide-react";
import { cn } from "@/lib/utils";

type TreatmentProps = {
  treatment: {
    name: string;
    evidenceLevel: "high" | "medium" | "low";
    benefits: { text: string }[];
    sideEffects: { 
      text: string; 
      warning?: boolean; 
      info?: boolean 
    }[];
    source: string;
  };
};

export default function TreatmentCard({ treatment }: TreatmentProps) {
  const getBorderClass = () => {
    switch (treatment.evidenceLevel) {
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
  
  const getEvidenceBadge = () => {
    switch (treatment.evidenceLevel) {
      case "high":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Evidence</Badge>;
      case "medium":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Medium Evidence</Badge>;
      case "low":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Low Evidence</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden shadow-sm",
      getBorderClass()
    )}>
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <h4 className="font-medium text-gray-900">{treatment.name}</h4>
        {getEvidenceBadge()}
      </div>
      <div className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Key Benefits</h5>
            <ul className="text-sm space-y-1">
              {treatment.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-1.5 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: benefit.text }} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Side Effects & Considerations</h5>
            <ul className="text-sm space-y-1">
              {treatment.sideEffects.map((effect, index) => (
                <li key={index} className="flex items-start">
                  {effect.warning ? (
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-1.5 flex-shrink-0" />
                  ) : effect.info ? (
                    <Info className="h-5 w-5 text-blue-500 mr-1.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-1.5 flex-shrink-0" />
                  )}
                  <span dangerouslySetInnerHTML={{ __html: effect.text }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            <strong>Source:</strong> {treatment.source}
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Learn More
            </Button>
            <Button size="sm" className="bg-primary-700 hover:bg-primary-800">
              Compare
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
