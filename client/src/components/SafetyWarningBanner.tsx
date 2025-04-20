import React from "react";
import { AlertTriangle, Heart, Info, Shield, Award, CheckCircle2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlternativeTreatment } from "@shared/schema";

interface SafetyWarningBannerProps {
  variant?: "warning" | "info" | "caution";
  title?: string;
  showIcon?: boolean;
  interactions?: {treatment: string, severity: string, effect: string}[];
}

export default function SafetyWarningBanner({
  variant = "warning",
  title,
  showIcon = true,
  interactions = []
}: SafetyWarningBannerProps) {
  // Determine the alert styling based on variant
  const alertVariant = variant === "warning" ? "destructive" : "default";
  
  // Set default title if not provided
  const displayTitle = title || (
    variant === "warning" 
      ? "Warning About Unproven Approaches" 
      : variant === "caution"
      ? "Safety Precaution"
      : "Important Information"
  );
  
  // Icon to display
  const icon = showIcon ? (
    variant === "warning" ? 
      <AlertTriangle className="h-5 w-5" /> : 
      variant === "caution" ?
      <Shield className="h-5 w-5" /> :
      <Info className="h-5 w-5" />
  ) : null;
  
  // Description based on variant
  const description = variant === "warning" ? (
    <AlertDescription className="mt-2">
      <p className="font-medium mb-2">
        This treatment has not been scientifically proven and may have a high risk profile.
      </p>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li>Conventional cancer treatments should not be replaced by unproven alternatives</li>
        <li>Contact a healthcare professional before trying any alternative treatments</li>
        <li>Be aware of potential harmful interactions with your current treatments</li>
        <li>Some alternative providers may make unsupported claims about effectiveness</li>
      </ul>
      
      {interactions && interactions.length > 0 && (
        <div className="mt-4 border-t pt-2">
          <p className="font-medium mb-2 text-sm">Known Interactions:</p>
          <div className="space-y-2">
            {interactions.map((interaction, index) => {
              const getSeverityColor = (severity: string) => {
                switch (severity.toLowerCase()) {
                  case 'high': return "destructive";
                  case 'moderate': return "default";
                  case 'low': return "secondary";
                  default: return "outline";
                }
              };
              
              return (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Badge variant={getSeverityColor(interaction.severity)}>
                    {interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)} Risk
                  </Badge>
                  <div>
                    <span className="font-medium">{interaction.treatment}:</span> {interaction.effect}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AlertDescription>
  ) : variant === "caution" ? (
    <AlertDescription className="mt-2">
      <p className="font-medium mb-2">
        Approach this treatment with caution and maintain regular contact with your healthcare team.
      </p>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li>Always inform your oncologist about any complementary approaches you're considering</li>
        <li>Keep track of any side effects and report them to your healthcare provider</li>
        <li>Discontinue use if you experience any negative reactions</li>
        <li>Be especially cautious if you have pre-existing conditions or are on multiple medications</li>
      </ul>
      
      {interactions && interactions.length > 0 && (
        <div className="mt-4 border-t pt-2">
          <p className="font-medium mb-2 text-sm">Known Interactions:</p>
          <div className="space-y-2">
            {interactions.map((interaction, index) => {
              const getSeverityColor = (severity: string) => {
                switch (severity.toLowerCase()) {
                  case 'high': return "destructive";
                  case 'moderate': return "default";
                  case 'low': return "secondary";
                  default: return "outline";
                }
              };
              
              return (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Badge variant={getSeverityColor(interaction.severity)}>
                    {interaction.severity} Risk
                  </Badge>
                  <div>
                    <span className="font-medium">{interaction.treatment}:</span> {interaction.effect}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AlertDescription>
  ) : (
    <AlertDescription className="mt-2">
      <p className="font-medium mb-2">
        Discuss all complementary approaches with your healthcare team before beginning.
      </p>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li>Your oncology team needs complete information to provide optimal care</li>
        <li>Regular communication helps avoid potential treatment complications</li>
        <li>Your healthcare providers can help monitor for positive or negative effects</li>
        <li>Bring a list of all supplements, medications, and therapies to your appointments</li>
      </ul>
    </AlertDescription>
  );
  
  return (
    <Alert variant={alertVariant} className="mb-6">
      <div className="flex items-center gap-2">
        {icon}
        <AlertTitle>{displayTitle}</AlertTitle>
      </div>
      {description}
    </Alert>
  );
}

// Healthcare Discussion Component - can be used at the bottom of treatment pages
export function HealthcareDiscussionReminder() {
  return (
    <Card className="mt-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h3 className="font-medium">Important Healthcare Reminder</h3>
        </div>
        <Separator className="mb-3" />
        <p className="text-sm">
          Always discuss any alternative or complementary treatments with your healthcare team before starting them. 
          Your oncologist needs to know all approaches you're using to provide the best care and avoid potentially 
          harmful interactions. Keep a written record of all supplements and therapies to share during appointments.
        </p>
      </CardContent>
    </Card>
  );
}

// Institutional Support Badge Component
interface InstitutionalSupportProps {
  treatment: AlternativeTreatment;
}

export function InstitutionalSupportBadge({ treatment }: InstitutionalSupportProps) {
  // This would typically be data from the treatment record
  // For this example, we'll check if recommendedBy contains any references to cancer centers
  
  const hasInstitutionalSupport = treatment.recommendedBy && 
    (treatment.recommendedBy.toLowerCase().includes("cancer center") ||
     treatment.recommendedBy.toLowerCase().includes("memorial sloan") ||
     treatment.recommendedBy.toLowerCase().includes("mayo clinic") ||
     treatment.recommendedBy.toLowerCase().includes("md anderson") ||
     treatment.recommendedBy.toLowerCase().includes("dana-farber"));

  if (!hasInstitutionalSupport) return null;
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-800">
        <Award className="mr-1 h-3 w-3" />
        Institutional Support
      </Badge>
      <span className="text-sm text-muted-foreground">
        This approach is endorsed or studied by major cancer treatment centers
      </span>
    </div>
  );
}

// Safety Guidance Component
export function SafetyGuidance({ safetyRating }: { safetyRating?: string }) {
  if (!safetyRating) return null;
  
  let icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
  let title = "Generally Safe When Used Appropriately";
  let description = "This treatment has a good safety profile when used as directed.";
  let color = "text-green-700 dark:text-green-300";
  
  if (safetyRating === "Potentially Harmful" || safetyRating === "Use with Caution") {
    icon = <AlertTriangle className="h-5 w-5 text-red-500" />;
    title = "Potential Safety Concerns";
    description = "This treatment has known risks and should be used with caution.";
    color = "text-red-700 dark:text-red-300";
  } else if (safetyRating === "Safe with Precautions") {
    icon = <Shield className="h-5 w-5 text-yellow-500" />;
    title = "Safe When Proper Precautions Are Taken";
    description = "This treatment requires certain precautions to minimize risks.";
    color = "text-yellow-700 dark:text-yellow-300";
  }
  
  return (
    <div className="mb-4 border rounded-md p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className={`font-medium ${color}`}>{title}</h3>
      </div>
      <p className="text-sm">{description}</p>
      <p className="text-sm font-medium mt-2">Safety Rating: {safetyRating}</p>
    </div>
  );
}