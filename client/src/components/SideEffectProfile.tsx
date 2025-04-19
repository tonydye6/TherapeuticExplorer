import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  List, 
  Shield, 
  UserCog, 
  CheckCircle2,
  AlertCircle,
  Activity
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface TreatmentSideEffect {
  name: string;
  description: string;
  likelihood: number;   // 0-100%
  severity: 'mild' | 'moderate' | 'severe';
  timeframe: string;    // e.g., "First 2 weeks", "Throughout treatment"
  managementOptions: string[];
  preventativeMeasures: string[];
  riskFactors: string[];
  relatedToPatientCharacteristics: boolean;
  recommendedMonitoring: string[];
}

export interface SideEffectProfile {
  treatmentName: string;
  overallRisk: number; // 0-100%
  sideEffects: TreatmentSideEffect[];
  patientSpecificConsiderations: string[];
  recommendedPretreatmentActions: string[];
}

interface SideEffectProfileProps {
  profile: SideEffectProfile;
  className?: string;
}

export const SideEffectProfile: React.FC<SideEffectProfileProps> = ({ profile, className = '' }) => {
  // Get color for risk level
  const getRiskColor = (risk: number) => {
    if (risk < 25) return 'bg-green-500';
    if (risk < 50) return 'bg-yellow-500';
    if (risk < 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get badge variant for severity level
  const getSeverityBadge = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`side-effect-profile ${className}`}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Side Effect Profile: {profile.treatmentName}</span>
            <Badge variant="outline" className={`px-3 py-1 ${getRiskColor(profile.overallRisk)} text-white`}>
              {profile.overallRisk}% Overall Risk
            </Badge>
          </CardTitle>
          <CardDescription>
            Analysis of potential side effects based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Patient-specific considerations */}
          {profile.patientSpecificConsiderations?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                <UserCog className="h-5 w-5" />
                <span>Patient-Specific Considerations</span>
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {profile.patientSpecificConsiderations.map((consideration, idx) => (
                  <li key={idx} className="text-sm">{consideration}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Pretreatment Actions */}
          {profile.recommendedPretreatmentActions?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Recommended Before Treatment</span>
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {profile.recommendedPretreatmentActions.map((action, idx) => (
                  <li key={idx} className="text-sm">{action}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side Effects Accordion */}
      <h3 className="text-xl font-medium mb-4">Potential Side Effects</h3>
      
      <Accordion type="multiple" className="space-y-4">
        {profile.sideEffects?.length > 0 ? (
          profile.sideEffects
            .sort((a, b) => b.likelihood - a.likelihood)
            .map((sideEffect, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg p-1">
                <AccordionTrigger className="px-4 py-2 hover:no-underline">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left">
                    <div className="font-medium">{sideEffect.name}</div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Badge variant="outline" className={getSeverityBadge(sideEffect.severity)}>
                        {sideEffect.severity?.charAt(0).toUpperCase() + sideEffect.severity?.slice(1) || 'Unknown'}
                      </Badge>
                      <span className="text-sm font-normal">{sideEffect.likelihood}% likelihood</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-700 mb-2">{sideEffect.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Clock className="h-4 w-4" />
                        <span>{sideEffect.timeframe}</span>
                      </div>
                      <Progress 
                        value={sideEffect.likelihood} 
                        className={`h-2 w-full ${getRiskColor(sideEffect.likelihood)}`} 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Management Options */}
                      {sideEffect.managementOptions?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Management Options</span>
                          </h4>
                          <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                            {sideEffect.managementOptions.map((option, i) => (
                              <li key={i} className="text-gray-700">{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Preventative Measures */}
                      {sideEffect.preventativeMeasures?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                            <Shield className="h-4 w-4" />
                            <span>Prevention</span>
                          </h4>
                          <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                            {sideEffect.preventativeMeasures.map((measure, i) => (
                              <li key={i} className="text-gray-700">{measure}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Risk Factors */}
                      {sideEffect.riskFactors?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Risk Factors</span>
                          </h4>
                          <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                            {sideEffect.riskFactors.map((factor, i) => (
                              <li key={i} className={sideEffect.relatedToPatientCharacteristics ? "text-orange-700 font-medium" : "text-gray-700"}>
                                {factor}
                                {sideEffect.relatedToPatientCharacteristics && factor.toLowerCase().includes("patient") && " (applies to you)"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommended Monitoring */}
                      {sideEffect.recommendedMonitoring?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                            <Activity className="h-4 w-4" />
                            <span>Monitoring</span>
                          </h4>
                          <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                            {sideEffect.recommendedMonitoring.map((monitoring, i) => (
                              <li key={i} className="text-gray-700">{monitoring}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))
        ) : (
          <p className="text-gray-500 text-center py-4">No side effect data available</p>
        )}
      </Accordion>
    </div>
  );
};

export default SideEffectProfile;