import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <div className="min-h-screen w-full bg-background font-poppins">
    <div className="fixed top-0 left-0 z-50 p-2 bg-green-500 text-white">
      Full App Mounted
    </div>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </div>
);

export default App;
