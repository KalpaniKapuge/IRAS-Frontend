import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppRouter } from "@/app/router";

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <AppRouter />
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  );
}
