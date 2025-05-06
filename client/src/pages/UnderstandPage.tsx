import React from 'react';
import { TabsLayout } from '@/components/ui/tabs-layout';
import AIExplainerPage from './AIExplainerPage';
import TreatmentTracker from './TreatmentTracker';
import SideEffectAnalyzer from './SideEffectAnalyzer';
import DocumentsPage from './DocumentsPage';
import { 
  BrainCircuit,
  Stethoscope,
  Activity,
  FileText
} from 'lucide-react';

const UnderstandPage = () => {
  const tabs = [
    {
      id: 'explainer',
      label: 'AI Medical Explainer',
      icon: <BrainCircuit className="h-4 w-4" />,
      content: <AIExplainerPage inTabView />
    },
    {
      id: 'treatments',
      label: 'Treatment Guides',
      icon: <Stethoscope className="h-4 w-4" />,
      content: <TreatmentTracker inTabView />
    },
    {
      id: 'interactions',
      label: 'Interaction Checker',
      icon: <Activity className="h-4 w-4" />,
      content: <SideEffectAnalyzer inTabView />
    },
    {
      id: 'documents',
      label: 'Document Summarizer',
      icon: <FileText className="h-4 w-4" />,
      content: <DocumentsPage inTabView />
    }
  ];

  return (
    <TabsLayout 
      title="Understand" 
      description="Simplify complex medical information and get clear explanations of your treatments, medications, and documents"
      tabs={tabs}
    />
  );
};

export default UnderstandPage;
