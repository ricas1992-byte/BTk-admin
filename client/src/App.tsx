import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import WritingStudio from "@/pages/WritingStudio";
import LearningHub from "@/pages/LearningHub";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/documents" component={Documents} />
      <Route path="/writing" component={WritingStudio} />
      <Route path="/writing/:id" component={WritingStudio} />
      <Route path="/learning" component={LearningHub} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
