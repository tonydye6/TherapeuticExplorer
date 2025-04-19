import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "./components/Layout";
import ResearchAssistant from "./pages/ResearchAssistant";
import SavedResearch from "./pages/SavedResearch";
import TreatmentTracker from "./pages/TreatmentTracker";
import ClinicalTrials from "./pages/ClinicalTrials";
import Documents from "./pages/Documents";
import Preferences from "./pages/Preferences";
import Help from "./pages/Help";
import SemanticSearch from "./pages/SemanticSearch";
import TreatmentPredictor from "./pages/TreatmentPredictor";
import SideEffectAnalyzer from "./pages/SideEffectAnalyzer";
import TreatmentTimelinePage from "./pages/TreatmentTimelinePage";
import TreatmentCompanionPage from "./pages/TreatmentCompanionPage";
import MedicalTerminologyTranslator from "./pages/MedicalTerminologyTranslator";
import TestPage from "./pages/TestPage";
import PublicTestPage from "./pages/PublicTestPage";
import SimpleTestPage from "./pages/SimpleTestPage";
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from "./components/security/AuthProvider";
import { ProtectedRoute } from "./components/security/ProtectedRoute";

function Router() {
  console.log("Rendering Router function");
  
  return (
    <Switch>
      {/* Super simple test page with no other dependencies */}
      <Route path="/simple-test" component={SimpleTestPage} />
      
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/public-test" component={PublicTestPage} />
      
      {/* Temporarily making all routes public to fix the blank screen issue */}
      <Route path="/">
        <Layout>
          <Switch>
            <Route path="/" component={ResearchAssistant} />
            <Route path="/saved-research" component={SavedResearch} />
            <Route path="/treatment-tracker" component={TreatmentTracker} />
            <Route path="/treatment-predictor" component={TreatmentPredictor} />
            <Route path="/side-effect-analyzer" component={SideEffectAnalyzer} />
            <Route path="/treatment-timeline" component={TreatmentTimelinePage} />
            <Route path="/treatment-companion" component={TreatmentCompanionPage} />
            <Route path="/clinical-trials" component={ClinicalTrials} />
            <Route path="/documents" component={Documents} />
            <Route path="/semantic-search" component={SemanticSearch} />
            <Route path="/medical-translator" component={MedicalTerminologyTranslator} />
            <Route path="/test" component={TestPage} />
            <Route path="/preferences" component={Preferences} />
            <Route path="/help" component={Help} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
