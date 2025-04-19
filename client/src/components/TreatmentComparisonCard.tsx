import React, { useState } from "react";
import { Bookmark, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the treatment type with properties described in the spec
export type TreatmentOption = {
  name: string;
  type: string; // Chemotherapy, Immunotherapy, etc.
  efficacyScore: number; // 0-100
  evidenceQuality: 1 | 2 | 3 | 4 | 5; // 5-star rating
  sideEffects: {
    name: string;
    severity: 1 | 2 | 3 | 4 | 5; // 1-5 severity scale
  }[];
  keyBenefits: string[];
  keyDrawbacks: string[];
  description?: string;
  approvalStatus?: string;
  url?: string;
};

type TreatmentComparisonCardProps = {
  treatment: TreatmentOption;
  onCompare?: (treatment: TreatmentOption, isSelected: boolean) => void;
  onSave?: (treatment: TreatmentOption) => void;
  selected?: boolean;
  saved?: boolean;
};

export default function TreatmentComparisonCard({
  treatment,
  onCompare,
  onSave,
  selected = false,
  saved = false,
}: TreatmentComparisonCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Render stars for evidence quality
  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            viewBox="0 0 24 24"
            fill={star <= rating ? "currentColor" : "none"}
            stroke={star <= rating ? "none" : "currentColor"}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  // Render severity dots for side effects
  const renderSeverityDots = (severity: number) => {
    return (
      <span className="text-orange-500">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span key={dot}>{dot <= severity ? "●" : "○"}</span>
        ))}
      </span>
    );
  };

  return (
    <div className="treatment-card bg-white rounded-xl shadow p-5 my-4 w-full">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-bold text-xl text-gray-900">{treatment.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {treatment.type}
          </span>
          {treatment.approvalStatus && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2">
              {treatment.approvalStatus}
            </span>
          )}
        </div>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="treatment-details space-y-4">
        {/* Efficacy Section - Always visible */}
        <div>
          <h4 className="font-medium text-sm text-gray-500 mb-1">EFFICACY</h4>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={cn(
                "h-2.5 rounded-full",
                treatment.efficacyScore >= 80
                  ? "bg-green-600"
                  : treatment.efficacyScore >= 50
                  ? "bg-blue-600"
                  : "bg-orange-500"
              )}
              style={{ width: `${treatment.efficacyScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Limited</span>
            <span>Very Effective</span>
          </div>
        </div>

        {/* Evidence Quality - Always visible */}
        <div>
          <h4 className="font-medium text-sm text-gray-500 mb-1">
            EVIDENCE QUALITY
          </h4>
          {renderStars(treatment.evidenceQuality)}
        </div>

        {/* Expanded content */}
        {expanded && (
          <>
            {/* Description if available */}
            {treatment.description && (
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">
                  DESCRIPTION
                </h4>
                <p className="text-sm text-gray-700">{treatment.description}</p>
              </div>
            )}

            {/* Side Effects Section */}
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-1">
                COMMON SIDE EFFECTS
              </h4>
              <ul className="ml-5 list-disc space-y-1">
                {treatment.sideEffects.map((effect, index) => (
                  <li key={index} className="text-sm">
                    {effect.name}{" "}
                    <span className="ml-2">
                      {renderSeverityDots(effect.severity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Benefits Section */}
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-1">
                KEY BENEFITS
              </h4>
              <ul className="ml-5 list-disc space-y-1">
                {treatment.keyBenefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="text-sm text-green-800 bg-green-50 py-1 px-2 rounded"
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Drawbacks Section */}
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-1">
                KEY DRAWBACKS
              </h4>
              <ul className="ml-5 list-disc space-y-1">
                {treatment.keyDrawbacks.map((drawback, index) => (
                  <li
                    key={index}
                    className="text-sm text-red-800 bg-red-50 py-1 px-2 rounded"
                  >
                    {drawback}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex justify-between mt-4 pt-2 border-t border-gray-100">
        {treatment.url ? (
          <a
            href={treatment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            Learn More <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        ) : (
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Learn More
          </button>
        )}

        <div className="flex space-x-3">
          {onCompare && (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={selected}
                onChange={(e) => onCompare(treatment, e.target.checked)}
              />
              <span className="ml-1 text-sm text-gray-700">Compare</span>
            </label>
          )}

          {onSave && (
            <button
              className={cn(
                "text-sm flex items-center",
                saved
                  ? "text-yellow-600 hover:text-yellow-800"
                  : "text-gray-600 hover:text-gray-800"
              )}
              onClick={() => onSave(treatment)}
            >
              <Bookmark className="w-4 h-4 mr-1" fill={saved ? "currentColor" : "none"} />
              {saved ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}