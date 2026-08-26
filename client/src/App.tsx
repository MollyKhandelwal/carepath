/*
 * CAREPATH Clinical Instrument direction: the router keeps every workspace
 * view in the same stateful application shell, with Simulator as the entry.
 */
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CarePathProvider } from "@/contexts/CarePathContext";
import Overview from "@/pages/Overview";
import Scenario from "@/pages/Scenario";
import Pathways from "@/pages/Pathways";
import Simulator from "@/pages/Simulator";
import Replay from "@/pages/Replay";
import Compare from "@/pages/Compare";
import Sources from "@/pages/Sources";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

function RootRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate("/simulator", { replace: true }); }, [navigate]);
  return null;
}

function Router() {
  return <Switch>
    <Route path="/" component={RootRedirect} />
    <Route path="/overview" component={Overview} />
    <Route path="/scenario" component={Scenario} />
    <Route path="/pathways" component={Pathways} />
    <Route path="/simulator" component={Simulator} />
    <Route path="/replay" component={Replay} />
    <Route path="/compare" component={Compare} />
    <Route path="/sources" component={Sources} />
    <Route path="/settings" component={Settings} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><CarePathProvider><Toaster theme="dark" position="bottom-right" /><Router /></CarePathProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
