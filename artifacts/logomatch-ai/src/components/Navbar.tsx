import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { StatusPill } from "./StatusPill";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/add-logo": "Add Company Logo",
  "/recognize": "Recognize Logo",
  "/model-lab": "Model Lab",
  "/dataset": "Dataset Manager",
  "/experiments": "Experiments",
};

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = PAGE_TITLES[location] ?? "LogoMatch AI";

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/60 backdrop-blur-xl border-b border-white/5">
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden h-9 w-9 rounded-md border border-white/10 flex items-center justify-center hover-elevate"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <h2 className="text-base md:text-lg font-medium truncate">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <StatusPill label="Model: Idle" variant="warning" />
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border border-white/10 flex items-center justify-center text-xs font-semibold">
            ML
          </div>
        </div>
      </div>
    </header>
  );
}
