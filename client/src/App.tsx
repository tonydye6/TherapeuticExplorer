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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ResearchAssistant} />
        <Route path="/saved-research" component={SavedResearch} />
        <Route path="/treatment-tracker" component={TreatmentTracker} />
        <Route path="/treatment-predictor" component={TreatmentPredictor} />
        <Route path="/side-effect-analyzer" component={SideEffectAnalyzer} />
        <Route path="/clinical-trials" component={ClinicalTrials} />
        <Route path="/documents" component={Documents} />
        <Route path="/semantic-search" component={SemanticSearch} />
        <Route path="/preferences" component={Preferences} />
        <Route path="/help" component={Help} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
