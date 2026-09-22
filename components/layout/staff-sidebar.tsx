"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCheck,
  CloudRain,
  FileDown,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Stethoscope,
  TrendingUp,
  User,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { label: "Dashboard", href: "/staff", icon: Home },
  { label: "Submit Disease Case", href: "/staff/cases/new", icon: PlusCircle },
  { label: "Disease Cases", href: "/staff/cases", icon: Stethoscope },
  { label: "Environmental Data", href: "/staff/environmental", icon: CloudRain },
  { label: "Validate Records", href: "/staff/validate", icon: CheckCheck },
  { label: "Analyze Trends", href: "/staff/trends", icon: TrendingUp },
  { label: "Generate Reports", href: "/staff/reports", icon: FileDown },
  { label: "Predictions & Alerts", href: "/staff/predictions", icon: AlertTriangle },
  { label: "Profile", href: "/staff/profile", icon: User },
];

function SidebarContent({
  name,
  specialty,
  mobile = false,
}: {
  name: string;
  specialty: string;
  mobile?: boolean;
}) {
  const path = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="h-20 border-b px-4 flex flex-col justify-center">
        <Link href="/staff" className="text-sm font-semibold tracking-tight text-primary">
          CholeraPredict
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">Staff Surveillance Portal</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/staff" ? path === href : path.startsWith(href);
          const link = (
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );

          return mobile ? (
            <SheetClose asChild key={href}>
              {link}
            </SheetClose>
          ) : (
            <div key={href}>{link}</div>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="px-2 mb-3 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{specialty || "Public Health Staff"}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={signOut}
        >
          <LogOut size={14} className="mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
}

export function StaffSidebar({
  name,
  specialty,
}: {
  name: string;
  specialty: string;
}) {
  return (
    <>
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-56 border-r bg-background">
        <SidebarContent name={name} specialty={specialty} />
      </aside>

      <header className="lg:hidden h-14 sticky top-0 z-40 border-b bg-background flex items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0 gap-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Staff navigation</SheetTitle>
            <SidebarContent name={name} specialty={specialty} mobile />
          </SheetContent>
        </Sheet>
        <div className="ml-2">
          <p className="text-sm font-semibold tracking-tight text-primary">CholeraPredict</p>
          <p className="text-[10px] text-muted-foreground">Staff Portal</p>
        </div>
      </header>
    </>
  );
}
