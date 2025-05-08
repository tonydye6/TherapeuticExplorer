import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "./components/Layout";

// Import all existing pages
import ResearchAssistant from "./pages/ResearchAssistant";
import SavedResearch from "./pages/SavedResearch";
import TreatmentTracker from "./pages/TreatmentTracker";
import ClinicalTrials from "./pages/ClinicalTrials";
import Documents from "./pages/Documents";
import DocumentsPage from "./pages/DocumentsPage";
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
import NeoBrutalismDemo from "./pages/NeoBrutalismDemo";
import DesignSystemAccess from "./pages/DesignSystemAccess";
import DirectAccessDemo from "./pages/DirectAccessDemo";
import NeoBrutalismLayout from "./components/layouts/NeoBrutalismLayout";
//import CanvasPage from "./pages/CanvasPage";

// Import Connect & Hope section pages
import SurvivorStoriesPage from "./pages/SurvivorStoriesPage";
import ResourceHubPage from "./pages/ResourceHubPage";
import CaregiverConnectPage from "./pages/CaregiverConnectPage";

// Temporary redirect component
const RedirectWithMessage = ({ to }: { to: string }) => {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold mb-4">Redirecting...</h2>
      <p className="mb-4">This page has moved to a new location in the Sophera structure.</p>
      <p>You'll be redirected in a moment.</p>
      <Redirect to={to} />
    </div>
  );
};

// Wrapper components for pages with inTabView props to make them compatible with wouter
const MyPlanPageWrapper = () => <MyPlanPage inTabView={false} />;
const JournalLogsPageWrapper = () => <JournalLogsPage inTabView={false} />;
const DietLogsPageWrapper = () => <DietLogsPage inTabView={false} />;
const SemanticSearchWrapper = () => <SemanticSearch inTabView={false} />;
const TreatmentTrackerWrapper = () => <TreatmentTracker inTabView={false} />;
const SideEffectAnalyzerWrapper = () => <SideEffectAnalyzer inTabView={false} />;
const DocumentsPageWrapper = () => <DocumentsPage inTabView={false} />;
const ResearchAssistantWrapper = () => <ResearchAssistant inTabView={false} />;
const ClinicalTrialsWrapper = () => <ClinicalTrials inTabView={false} />;
const MultimodalChatPageWrapper = () => <MultimodalChatPage inTabView={false} />;
const SurvivorStoriesPageWrapper = () => <SurvivorStoriesPage inTabView={false} />;
const HopeSnippetsPageWrapper = () => <HopeSnippetsPage inTabView={false} />;
const ResourceHubPageWrapper = () => <ResourceHubPage inTabView={false} />;
const CaregiverConnectPageWrapper = () => <CaregiverConnectPage inTabView={false} />;

function Router() {
  return (
    <NeoBrutalismLayout>
      <Switch>
        {/* Today (Dashboard) */}
        <Route path="/today" component={DashboardPage} />
        <Route path="/" component={() => <Redirect to="/today" />} />
        <Route path="/dashboard" component={() => <RedirectWithMessage to="/today" />} />

        {/* My Journey Section */}
        <Route path="/my-journey/plan" component={MyPlanPageWrapper} />
        <Route path="/my-plan" component={() => <RedirectWithMessage to="/my-journey/plan" />} />

        <Route path="/my-journey/journal" component={JournalLogsPageWrapper} />
        <Route path="/journal-logs" component={() => <RedirectWithMessage to="/my-journey/journal" />} />

        <Route path="/my-journey/diet" component={DietLogsPageWrapper} />
        <Route path="/diet-logs" component={() => <RedirectWithMessage to="/my-journey/diet" />} />

        <Route path="/my-journey/metrics" component={() => <div>My Metrics - Coming Soon</div>} />
        <Route path="/my-journey/trends" component={() => <div>Trends - Coming Soon</div>} />

        {/* Understand Section */}
        <Route path="/understand/explainer" component={SemanticSearchWrapper} />
        <Route path="/semantic-search" component={() => <RedirectWithMessage to="/understand/explainer" />} />

        <Route path="/understand/treatments" component={TreatmentTrackerWrapper} />
        <Route path="/treatment-tracker" component={() => <RedirectWithMessage to="/understand/treatments" />} />

        <Route path="/understand/interactions" component={SideEffectAnalyzerWrapper} />
        <Route path="/side-effect-analyzer" component={() => <RedirectWithMessage to="/understand/interactions" />} />

        <Route path="/understand/documents" component={DocumentsPageWrapper} />
        <Route path="/documents" component={() => <RedirectWithMessage to="/understand/documents" />} />

        {/* Explore Section */}
        <Route path="/explore/search" component={ResearchAssistantWrapper} />
        <Route path="/saved-research" component={() => <RedirectWithMessage to="/explore/search" />} />

        <Route path="/explore/trials" component={ClinicalTrialsWrapper} />
        <Route path="/clinical-trials" component={() => <RedirectWithMessage to="/explore/trials" />} />

        <Route path="/explore/creative" component={MultimodalChatPageWrapper} />
        <Route path="/multimodal-chat" component={() => <RedirectWithMessage to="/explore/creative" />} />

        {/* Connect & Hope Section */}
        <Route path="/connect/stories" component={SurvivorStoriesPageWrapper} />
        <Route path="/connect/mindfulness" component={HopeSnippetsPageWrapper} />
        <Route path="/connect/resources" component={ResourceHubPageWrapper} />
        <Route path="/connect/caregivers" component={CaregiverConnectPageWrapper} />
        <Route path="/hope-snippets" component={() => <RedirectWithMessage to="/connect/mindfulness" />} />

        {/* Settings Section */}
        <Route path="/settings/profile" component={Preferences} />
        <Route path="/preferences" component={() => <RedirectWithMessage to="/settings/profile" />} />
        <Route path="/help" component={Help} />

        {/* Handle old routes that don't fit in new structure */}
        <Route path="/alternative-treatments" component={() => <RedirectWithMessage to="/understand/treatments" />} />
        <Route path="/treatment-predictor" component={() => <RedirectWithMessage to="/understand/treatments" />} />
        <Route path="/treatment-timeline" component={() => <RedirectWithMessage to="/understand/treatments" />} />

        {/* Design System Routes */}
        <Route path="/design" component={DesignSystemAccess} />
        <Route path="/design/neo-brutalism" component={NeoBrutalismDemo} />
        <Route path="/neo-brutalism-direct" component={DirectAccessDemo} />

        {/* 404 route */}
        <Route component={NotFound} />
      </Switch>
    </NeoBrutalismLayout>
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