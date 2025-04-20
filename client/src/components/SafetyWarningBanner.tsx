import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlternativeTreatment } from "@shared/schema";
import { AlertTriangle, Shield, Heart, Award, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Safety Warning Banner component that displays appropriate warnings based on treatment safety
 */
interface SafetyWarningBannerProps {
  variant: "warning" | "info" | "caution";
  title: string;
  interactions?: {treatment: string, severity: string, effect: string}[];
}

export default function SafetyWarningBanner({ variant, title, interactions = [] }: SafetyWarningBannerProps) {
  // Determine styling based on variant
  const getStyle = () => {
    switch(variant) {
      case "warning":
        return {
          background: "bg-red-50 dark:bg-red-950",
          border: "border-red-200 dark:border-red-800",
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          textColor: "text-red-800 dark:text-red-200"
        };
      case "caution":
        return {
          background: "bg-amber-50 dark:bg-amber-950",
          border: "border-amber-200 dark:border-amber-800",
          icon: <Shield className="h-5 w-5 text-amber-500" />,
          textColor: "text-amber-800 dark:text-amber-200"
        };
      case "info":
      default:
        return {
          background: "bg-blue-50 dark:bg-blue-950",
          border: "border-blue-200 dark:border-blue-800",
          icon: <Info className="h-5 w-5 text-blue-500" />,
          textColor: "text-blue-800 dark:text-blue-200"
        };
    }
  };

  const style = getStyle();
  
  return (
    <div className={`p-4 rounded-lg border ${style.background} ${style.border} mb-4`}>
      <div className="flex items-start gap-3">
        {style.icon}
        <div>
          <h3 className={`text-lg font-medium ${style.textColor}`}>{title}</h3>
          <p className={`mt-1 text-sm ${style.textColor}`}>
            {variant === "warning" ? (
              "This treatment has potential risks. Please discuss with your healthcare provider before considering use."
            ) : variant === "caution" ? (
              "Use with caution. Consider consulting your healthcare provider before starting this treatment."
            ) : (
              "For informational purposes. Always coordinate with your medical team."
            )}
          </p>
          
          {/* Show interactions if provided */}
          {interactions.length > 0 && (
            <div className="mt-3">
              <h4 className={`text-sm font-medium ${style.textColor} mb-2`}>Known Drug Interactions:</h4>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {interactions.map((item, index) => (
                  <li key={index} className={style.textColor}>
                    <span className="font-medium">{item.treatment}</span>: {item.effect} 
                    <Badge variant={
                      item.severity.toLowerCase() === 'high' ? 'destructive' :
                      item.severity.toLowerCase() === 'moderate' ? 'default' :
                      'secondary'
                    } className="ml-2 text-xs">
                      {item.severity}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Healthcare Discussion Reminder component that encourages consultation
 */
export function HealthcareDiscussionReminder() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <Heart className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-medium">Discuss with Your Healthcare Team</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Always discuss any complementary approaches with your oncologist and healthcare team 
            before beginning. This ensures coordination of care and helps avoid potentially harmful 
            interactions with your primary cancer treatment.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Institutional Support Badge component that indicates if a treatment is endorsed
 */
export function InstitutionalSupportBadge({ treatment }: { treatment: AlternativeTreatment }) {
  // Check if the treatment has institutional support by checking if recommendedBy contains words like
  // "cancer center", "hospital", "institute", etc.
  const hasInstitutionalSupport = () => {
    if (!treatment.recommendedBy) return false;
    
    const lowerCaseText = treatment.recommendedBy.toLowerCase();
    const keywords = [
      "cancer center", 
      "hospital", 
      "institute", 
      "medical center", 
      "clinic", 
      "university", 
      "research center",
      "nci",
      "nih"
    ];
    
    return keywords.some(keyword => lowerCaseText.includes(keyword));
  };
  
  if (!hasInstitutionalSupport()) return null;
  
  return (
    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <Award className="h-5 w-5 text-green-500" />
        <div>
          <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
            Institutionally Recognized Treatment
          </h3>
          <p className="mt-1 text-sm text-green-800 dark:text-green-200">
            This complementary approach has been acknowledged or recommended by established
            medical institutions as potentially beneficial when used appropriately.
          </p>
          {treatment.recommendedBy && (
            <p className="mt-2 text-sm font-medium text-green-800 dark:text-green-200">
              Recommended by: {treatment.recommendedBy}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Safety Guidance component that shows appropriate warnings based on safety rating
 */
export function SafetyGuidance({ safetyRating }: { safetyRating?: string }) {
  if (!safetyRating) return null;
  
  // Determine guidance text and alert variant based on safety rating
  const getGuidance = () => {
    switch (safetyRating) {
      case "Potentially Harmful":
        return {
          title: "Use Only Under Medical Supervision",
          description: "This treatment has potential risks that could negatively impact your health or interact with conventional treatments. Only consider under proper medical supervision.",
          variant: "destructive" as const
        };
      case "Use with Caution":
        return {
          title: "Precautions Required",
          description: "This treatment should be used with caution. Discuss with your healthcare team first and monitor for any adverse effects.",
          variant: "default" as const
        };
      case "Safe with Precautions":
        return {
          title: "Generally Safe but Follow Guidelines",
          description: "While generally considered safe, this treatment should be used according to established guidelines. Review contraindications and potential interactions.",
          variant: "default" as const
        };
      case "Generally Safe":
        return {
          title: "Generally Considered Safe",
          description: "Research suggests this treatment is generally well-tolerated, but individual responses may vary. Monitor for any unexpected effects.",
          variant: "default" as const
        };
      case "Very Safe":
        return {
          title: "Excellent Safety Profile",
          description: "This treatment has an excellent safety record with minimal reported adverse effects. As with any approach, individual responses may vary.",
          variant: "default" as const
        };
      default:
        return null;
    }
  };
  
  const guidance = getGuidance();
  if (!guidance) return null;
  
  return (
    <Alert variant={guidance.variant}>
      <Shield className="h-4 w-4" />
      <AlertTitle>{guidance.title}</AlertTitle>
      <AlertDescription>{guidance.description}</AlertDescription>
    </Alert>
  );
}