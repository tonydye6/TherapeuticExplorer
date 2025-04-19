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
import SimpleMedicalTranslator from "./pages/SimpleMedicalTranslator";
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from "./components/security/AuthProvider";
import { ProtectedRoute } from "./components/security/ProtectedRoute";

function Router() {
  console.log("Rendering Router function");
  
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/public-test" component={PublicTestPage} />
      <Route path="/simple-test" component={SimpleTestPage} />
      <Route path="/simple-medical" component={SimpleMedicalTranslator} />
      
      {/* Protected Routes */}
      {/* Main routes are temporarily bypassed for debugging */}
      <Route path="/main-app">
        <ProtectedRoute>
          <Layout>
            <Switch>
              <Route path="/main-app" component={ResearchAssistant} />
              <Route path="/main-app/saved-research" component={SavedResearch} />
              <Route path="/main-app/treatment-tracker" component={TreatmentTracker} />
              <Route path="/main-app/medical-translator" component={MedicalTerminologyTranslator} />
              <Route path="/main-app/test" component={TestPage} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </ProtectedRoute>
      </Route>
      
      {/* Default route to the simple test page */}
      <Route path="/" component={SimpleTestPage} />
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
