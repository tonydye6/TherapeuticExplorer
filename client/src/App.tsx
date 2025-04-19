import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SimpleTestPage from "./pages/SimpleTestPage";
import SimpleMedicalTranslator from "./pages/SimpleMedicalTranslator";
import EmergencyPage from "./pages/EmergencyPage";

function Router() {
  console.log("Rendering Router function");
  
  return (
    <Switch>
      {/* Simple Pages */}
      <Route path="/simple-test" component={SimpleTestPage} />
      <Route path="/simple-medical" component={SimpleMedicalTranslator} />
      
      {/* Default route to the emergency page */}
      <Route path="/" component={EmergencyPage} />
      
      {/* Fallback for any other routes */}
      <Route component={EmergencyPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* Temporarily remove AuthProvider to bypass authentication issues */}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
