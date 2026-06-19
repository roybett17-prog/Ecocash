import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Apply from "@/pages/apply";
import Submitted from "@/pages/submitted";
import Login from "@/pages/login";
import Waiting from "@/pages/waiting";
import Otp from "@/pages/otp";
import OtpWaiting from "@/pages/otp-waiting";
import Success from "@/pages/success";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/apply" component={Apply} />
      <Route path="/submitted" component={Submitted} />
      <Route path="/login" component={Login} />
      <Route path="/waiting" component={Waiting} />
      <Route path="/otp" component={Otp} />
      <Route path="/otp-waiting" component={OtpWaiting} />
      <Route path="/success" component={Success} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
