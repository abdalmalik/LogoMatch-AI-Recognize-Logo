import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/layouts/AppShell";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import AddLogo from "@/pages/AddLogo";
import Recognize from "@/pages/Recognize";
import ModelLab from "@/pages/ModelLab";
import DatasetManager from "@/pages/DatasetManager";
import Experiments from "@/pages/Experiments";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ShellRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AppShell>
      <Component />
    </AppShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard">
        <ShellRoute component={Dashboard} />
      </Route>
      <Route path="/add-logo">
        <ShellRoute component={AddLogo} />
      </Route>
      <Route path="/recognize">
        <ShellRoute component={Recognize} />
      </Route>
      <Route path="/model-lab">
        <ShellRoute component={ModelLab} />
      </Route>
      <Route path="/dataset">
        <ShellRoute component={DatasetManager} />
      </Route>
      <Route path="/experiments">
        <ShellRoute component={Experiments} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <SonnerToaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(222 47% 6%)",
              border: "1px solid hsl(217 33% 17%)",
              color: "hsl(210 40% 98%)",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
