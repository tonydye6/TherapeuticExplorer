import React from 'react';
import { TabsLayout } from '@/components/ui/tabs-layout';
import SemanticSearch from './SemanticSearch';
import TreatmentTracker from './TreatmentTracker';
import SideEffectAnalyzer from './SideEffectAnalyzer';
import DocumentsPage from './DocumentsPage';
import { 
  Brain,
  Stethoscope,
  Activity,
  FileText
} from 'lucide-react';

const UnderstandPage = () => {
  const tabs = [
    {
      id: 'explainer',
      label: 'AI Explainer',
      icon: <Brain className="h-4 w-4" />,
      content: <SemanticSearch inTabView />
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
      description="Simplify complex medical information and make sense of your documents"
      tabs={tabs}
    />
  );
};

export default UnderstandPage;
