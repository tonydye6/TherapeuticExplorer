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
import AlternativeTreatments from "./pages/AlternativeTreatments";
import MultimodalChatPage from "./pages/multimodal-chat-page";
import MyPlanPage from "./pages/MyPlanPage";
import JournalLogsPage from "./pages/JournalLogsPage";
import DietLogsPage from "./pages/DietLogsPage";
import DashboardPage from "./pages/DashboardPage";
import HopeSnippetsPage from "./pages/HopeSnippetsPage";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ResearchAssistant} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/saved-research" component={SavedResearch} />
        <Route path="/treatment-tracker" component={TreatmentTracker} />
        <Route path="/alternative-treatments" component={AlternativeTreatments} />
        <Route path="/treatment-predictor" component={TreatmentPredictor} />
        <Route path="/side-effect-analyzer" component={SideEffectAnalyzer} />
        <Route path="/treatment-timeline" component={TreatmentTimelinePage} />
        <Route path="/clinical-trials" component={ClinicalTrials} />
        <Route path="/documents" component={Documents} />
        <Route path="/semantic-search" component={SemanticSearch} />
        <Route path="/multimodal-chat" component={MultimodalChatPage} />
        <Route path="/my-plan" component={MyPlanPage} />
        <Route path="/journal-logs" component={JournalLogsPage} />
        <Route path="/diet-logs" component={DietLogsPage} />
        <Route path="/hope-snippets" component={HopeSnippetsPage} />
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
