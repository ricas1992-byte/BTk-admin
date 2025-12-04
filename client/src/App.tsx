import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/layout/Layout";
import { lazy, Suspense, useState, useCallback, memo } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ThemeProvider } from "next-themes";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Documents = lazy(() => import("@/pages/Documents"));
const WritingStudio = lazy(() => import("@/pages/WritingStudio"));
const LearningHub = lazy(() => import("@/pages/LearningHub"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/not-found"));

const PageFallback = memo(function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <LoadingSpinner />
    </div>
  );
});

const Router = memo(function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/documents" component={Documents} />
        <Route path="/writing" component={WritingStudio} />
        <Route path="/writing/:id" component={WritingStudio} />
        <Route path="/learning" component={LearningHub} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
});

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AppProvider>
          <TooltipProvider>
            <Layout>
              <Router />
            </Layout>
            <Toaster />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
