import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Today from "./pages/Today";
import Program from "./pages/Program";
import Lesson from "./pages/Lesson";
import Progress from "./pages/Progress";
import Materials from "./pages/Materials";
import Support from "./pages/Support";
import Admin from "./pages/Admin";
import Account from "./pages/Account";
import AccessEnded from "./pages/AccessEnded";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();
const configuredBase = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const routerBasename = configuredBase && configuredBase !== "" && window.location.pathname.startsWith(configuredBase)
  ? configuredBase
  : undefined;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
     <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/access-ended" element={<AccessEnded />} />
          <Route path="/" element={<ProtectedRoute><Today /></ProtectedRoute>} />
          <Route path="/program" element={<ProtectedRoute><Program /></ProtectedRoute>} />
          <Route path="/lesson/:day" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
