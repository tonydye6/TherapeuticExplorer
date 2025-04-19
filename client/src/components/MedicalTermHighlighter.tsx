import React, { useState } from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { MedicalTermCategory } from '../lib/types';

interface MedicalTermHighlighterProps {
  html: string;
  showTermCounts?: boolean;
  enableTooltips?: boolean;
  onTermClick?: (term: string, category: string) => void;
}

/**
 * MedicalTermHighlighter component that displays HTML content with highlighted medical terms
 * and provides tooltips with definitions
 */
const MedicalTermHighlighter: React.FC<MedicalTermHighlighterProps> = ({
  html,
  showTermCounts = true,
  enableTooltips = true,
  onTermClick,
}) => {
  // Extract term counts from HTML by parsing and counting span elements with medical-term class
  const [termCounts, setTermCounts] = useState<Record<string, number>>(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const terms = doc.querySelectorAll('.medical-term');
      
      const counts: Record<string, number> = {};
      terms.forEach(term => {
        const category = term.getAttribute('data-category') || 'unknown';
        counts[category] = (counts[category] || 0) + 1;
      });
      
      return counts;
    } catch (error) {
      console.error('Error counting medical terms:', error);
      return {};
    }
  });

  // Create a map of category colors for styling
  const categoryColors: Record<string, { bg: string; text: string }> = {
    diagnosis: { bg: 'bg-red-100', text: 'text-red-800' },
    medication: { bg: 'bg-blue-100', text: 'text-blue-800' },
    procedure: { bg: 'bg-purple-100', text: 'text-purple-800' },
    lab_test: { bg: 'bg-green-100', text: 'text-green-800' },
    vital_sign: { bg: 'bg-teal-100', text: 'text-teal-800' },
    anatomy: { bg: 'bg-orange-100', text: 'text-orange-800' },
    medical_device: { bg: 'bg-gray-100', text: 'text-gray-800' },
    genetic_marker: { bg: 'bg-pink-100', text: 'text-pink-800' },
    treatment: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    symptom: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    unknown: { bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  // Handle click on a medical term
  const handleTermClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onTermClick) return;
    
    const target = e.target as HTMLElement;
    const term = target.getAttribute('data-term');
    const category = target.getAttribute('data-category');
    
    if (term && category) {
      onTermClick(term, category);
    }
  };

  return (
    <div className="medical-term-highlighter">
      {/* Term count summary */}
      {showTermCounts && Object.keys(termCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(termCounts).map(([category, count]) => (
            <Badge 
              key={category} 
              variant="outline" 
              className={`${categoryColors[category]?.bg || 'bg-gray-100'} ${categoryColors[category]?.text || 'text-gray-800'}`}
            >
              {category}: {count}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Highlighted content */}
      <TooltipProvider>
        <div 
          className="prose prose-slate max-w-none" 
          dangerouslySetInnerHTML={{ __html: html }}
          onClick={handleTermClick}
        />
      </TooltipProvider>
    </div>
  );
};

export default MedicalTermHighlighter;