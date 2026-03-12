import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ParkingProvider } from "@/context/ParkingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Index from "./pages/Index";
import ParkVehicle from "./pages/ParkVehicle";
import ReserveSlot from "./pages/ReserveSlot";
import AdminDashboard from "./pages/AdminDashboard";
import VehicleHistory from "./pages/VehicleHistory";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { FloatingOrb } from "@/components/layout/FloatingOrb";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ParkingProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <FloatingOrb />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/park" element={<ParkVehicle />} />
              <Route path="/reserve" element={<ReserveSlot />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/history" element={<VehicleHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ParkingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
