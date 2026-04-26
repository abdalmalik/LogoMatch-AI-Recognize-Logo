import { useLocation } from "wouter";
import { Menu, User, Settings, Info, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "./Sidebar";
import { StatusPill } from "./StatusPill";
import { useState } from "react";
import { toast } from "sonner";

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

  const handleMenuClick = (label: string) => {
    toast(label, {
      description: "This feature will be available soon.",
    });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/60 backdrop-blur-xl border-b border-white/5">
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden h-9 w-9 rounded-md border border-white/10 flex items-center justify-center hover-elevate cursor-pointer"
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open account menu"
                className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border border-white/10 flex items-center justify-center text-xs font-semibold cursor-pointer transition-all duration-200 hover:border-primary/60 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                ML
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 glass-card border-white/10"
            >
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm">ML User</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  LogoMatch AI · Phase 1
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleMenuClick("Profile")}
                className="gap-2 cursor-pointer"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleMenuClick("Settings")}
                className="gap-2 cursor-pointer"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleMenuClick("Project Info")}
                className="gap-2 cursor-pointer"
              >
                <Info className="h-4 w-4 text-muted-foreground" />
                Project Info
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  toast.success("Signed out", {
                    description: "Demo only — no real session in Phase 1.",
                  })
                }
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
