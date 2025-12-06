import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import FirmaRegister from "./pages/FirmaRegister";
import EntegratorRegister from "./pages/EntegratorRegister";
import FirmaDashboard from "./pages/FirmaDashboard";
import EntegratorDashboard from "./pages/EntegratorDashboard";
import Dashboard from "./pages/Dashboard";
import CreateIlan from "./pages/CreateIlan";
import Notifications from "./pages/Notifications";
import FirmaProfile from "./pages/FirmaProfile";
import EntegratorProfile from "./pages/EntegratorProfile";
import FirmaIlanlar from "./pages/FirmaIlanlar";
import FirmaIhaleler from "./pages/FirmaIhaleler";
import IhaleDetay from "./pages/IhaleDetay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/firma/register" element={<FirmaRegister />} />
            <Route path="/firma/dashboard" element={<FirmaDashboard />} />
            <Route path="/firma/ilan-olustur" element={<CreateIlan />} />
            <Route path="/firma/ilanlarim" element={<FirmaIlanlar />} />
            <Route path="/firma/ihalelerim" element={<FirmaIhaleler />} />
            <Route path="/firma/profile" element={<FirmaProfile />} />
            <Route path="/entegrator/register" element={<EntegratorRegister />} />
            <Route path="/entegrator/dashboard" element={<EntegratorDashboard />} />
            <Route path="/entegrator/profile" element={<EntegratorProfile />} />
            <Route path="/ihale/:id" element={<IhaleDetay />} />
            <Route path="/notifications" element={<Notifications />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
