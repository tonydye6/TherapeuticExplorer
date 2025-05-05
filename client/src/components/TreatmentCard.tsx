import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Treatment } from "@shared/schema";
import {
  Pill,
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertTriangle,
  LineChart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import TreatmentSideEffectForm from "./TreatmentSideEffectForm";
import TreatmentEffectivenessForm from "./TreatmentEffectivenessForm";

interface TreatmentCardProps {
  treatment: Treatment;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
  onAddSideEffect: ({ treatmentId, sideEffect }: { treatmentId: number; sideEffect: any }) => void;
  onAddEffectiveness: ({ treatmentId, assessment }: { treatmentId: number; assessment: any }) => void;
  isSubmittingSideEffect: boolean;
  isSubmittingEffectiveness: boolean;
}

export default function TreatmentCard({
  treatment,
  onEdit,
  onDelete,
  onToggleActive,
  onAddSideEffect,
  onAddEffectiveness,
  isSubmittingSideEffect,
  isSubmittingEffectiveness
}: TreatmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [sideEffectDialogOpen, setSideEffectDialogOpen] = useState(false);
  const [effectivenessDialogOpen, setEffectivenessDialogOpen] = useState(false);

  // Format dates for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Get treatment type display name
  const getTreatmentTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      chemotherapy: "Chemotherapy",
      immunotherapy: "Immunotherapy",
      radiation: "Radiation Therapy",
      surgery: "Surgery",
      targeted: "Targeted Therapy",
      hormone: "Hormone Therapy",
      supplement: "Supplement",
      medication: "Medication",
      other: "Other"
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Get the latest side effects (most recent 3)
  const getSideEffects = () => {
    if (!treatment.sideEffects || !Array.isArray(treatment.sideEffects)) return [];
    
    return treatment.sideEffects
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, expanded ? undefined : 3);
  };

  // Get the latest effectiveness assessments (most recent 3)
  const getEffectivenessData = () => {
    if (!treatment.effectiveness || !Array.isArray(treatment.effectiveness)) return [];
    
    return treatment.effectiveness
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, expanded ? undefined : 3);
  };

  // Get side effect type display name
  const getSideEffectTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      nausea: "Nausea",
      fatigue: "Fatigue",
      pain: "Pain",
      skin_reaction: "Skin Reaction",
      headache: "Headache",
      diarrhea: "Diarrhea",
      constipation: "Constipation",
      loss_of_appetite: "Loss of Appetite",
      neuropathy: "Neuropathy",
      hair_loss: "Hair Loss",
      vomiting: "Vomiting",
      fever: "Fever",
      chills: "Chills",
      swelling: "Swelling",
      dizziness: "Dizziness",
      other: "Other"
    };
    return typeMap[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get severity color
  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "bg-green-100 text-green-800";
    if (severity <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Get effectiveness rating color
  const getEffectivenessColor = (rating: number) => {
    if (rating >= 7) return "bg-green-100 text-green-800";
    if (rating >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <>
      <Card className={treatment.active ? "border-primary-200" : "border-gray-200 bg-gray-50"}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div>
                  <CardTitle className="text-lg">{treatment.name}</CardTitle>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>{getTreatmentTypeDisplay(treatment.type)}</span>
                    <span className="mx-2">•</span>
                    <span>Started: {formatDate(treatment.startDate)}</span>
                    {treatment.endDate && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Ended: {formatDate(treatment.endDate)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Badge 
              variant={treatment.active ? "default" : "outline"}
              className={treatment.active ? "bg-green-100 hover:bg-green-200 text-green-800 hover:text-green-900 border-green-200" : ""}
            >
              {treatment.active ? "Active" : "Inactive"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(treatment.id)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleActive(treatment.id)}>
                  {treatment.active ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" /> Mark as Inactive
                    </>
                  ) : (
                    <>
                      <Pill className="h-4 w-4 mr-2" /> Mark as Active
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(treatment.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {treatment.notes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Notes</h4>
              <p className="text-sm text-gray-600">{treatment.notes}</p>
            </div>
          )}

          {/* Side Effects Section */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-600" /> Side Effects
              </h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSideEffectDialogOpen(true)}
              >
                Record
              </Button>
            </div>
            
            {getSideEffects().length > 0 ? (
              <div className="space-y-2">
                {getSideEffects().map((effect: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-md">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium text-sm">{getSideEffectTypeDisplay(effect.type)}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{formatDate(effect.date)}</span>
                      </div>
                      <Badge className={getSeverityColor(effect.severity)}>
                        Severity: {effect.severity}/10
                      </Badge>
                    </div>
                    {effect.notes && <p className="text-xs mt-1 text-gray-600">{effect.notes}</p>}
                  </div>
                ))}
                
                {!expanded && treatment.sideEffects && Array.isArray(treatment.sideEffects) && treatment.sideEffects.length > 3 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs mt-1" 
                    onClick={() => setExpanded(true)}
                  >
                    Show {treatment.sideEffects.length - 3} more <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No side effects recorded</p>
            )}
          </div>

          {/* Effectiveness Section */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium flex items-center">
                <LineChart className="h-4 w-4 mr-1 text-blue-600" /> Effectiveness
              </h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEffectivenessDialogOpen(true)}
              >
                Record
              </Button>
            </div>
            
            {getEffectivenessData().length > 0 ? (
              <div className="space-y-2">
                {getEffectivenessData().map((assessment: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{formatDate(assessment.date)}</span>
                      <Badge className={getEffectivenessColor(assessment.rating)}>
                        Rating: {assessment.rating}/10
                      </Badge>
                    </div>
                    
                    {assessment.metrics && Object.keys(assessment.metrics).length > 0 && (
                      <div className="mt-1 grid grid-cols-2 gap-1">
                        {Object.entries(assessment.metrics).map(([key, value], i) => (
                          <div key={i} className="text-xs">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {assessment.notes && <p className="text-xs mt-1 text-gray-600">{assessment.notes}</p>}
                  </div>
                ))}
                
                {!expanded && treatment.effectiveness && Array.isArray(treatment.effectiveness) && treatment.effectiveness.length > 3 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs mt-1" 
                    onClick={() => setExpanded(true)}
                  >
                    Show {treatment.effectiveness.length - 3} more <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No effectiveness data recorded</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          {expanded && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs" 
              onClick={() => setExpanded(false)}
            >
              Show less <ChevronUp className="h-3 w-3 ml-1" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Side Effect Dialog */}
      <TreatmentSideEffectForm
        isOpen={sideEffectDialogOpen}
        onClose={() => setSideEffectDialogOpen(false)}
        treatmentId={treatment.id}
        treatmentName={treatment.name}
        onSubmit={onAddSideEffect}
        isSubmitting={isSubmittingSideEffect}
      />

      {/* Effectiveness Dialog */}
      <TreatmentEffectivenessForm
        isOpen={effectivenessDialogOpen}
        onClose={() => setEffectivenessDialogOpen(false)}
        treatmentId={treatment.id}
        treatmentName={treatment.name}
        onSubmit={onAddEffectiveness}
        isSubmitting={isSubmittingEffectiveness}
      />
    </>
  );
}
