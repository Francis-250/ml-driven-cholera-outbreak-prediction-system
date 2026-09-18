"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Home,
  LogOut,
  MapPin,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { label: "Dashboard", href: "/community", icon: Home },
  { label: "Check Symptoms", href: "/community/symptoms", icon: Stethoscope },
  { label: "Statistics", href: "/community/statistics", icon: BarChart3 },
  { label: "Predictions", href: "/community/predictions", icon: Sparkles },
  { label: "High-Risk Regions", href: "/community/hotspots", icon: MapPin },
];

export default function CommunityNav({
  initials,
  unreadCount,
}: {
  initials?: string | null;
  unreadCount?: number;
}) {
  const path = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <>
      {/* Desktop — top */}
      <header className="hidden sm:flex h-14 sticky top-0 z-50 bg-background/95 backdrop-blur border-b justify-center">
        <div className="w-full max-w-6xl px-4 sm:px-6 flex items-center justify-between">
          <Link href="/community" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              CP
            </span>
            <span className="text-sm font-semibold tracking-tight">
              CholeraPredict
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map(({ label, href, icon: Icon }) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/community/notifications" className="relative p-1.5 rounded-md hover:bg-muted/50 transition-colors">
              <Bell size={17} className="text-muted-foreground" />
              {(unreadCount ?? 0) > 0 && (
                <span className="absolute 1 top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="rounded-full">
                  <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {initials ?? "--"}
                  </span>
                  <span className="sr-only">Open account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Community User</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/community/profile">
                    <User size={14} className="mr-2" /> Profile & Location
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={signOut}>
                  <LogOut size={14} className="mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile — bottom */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-background border-t flex">
        {links.map(({ label, href, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 pt-2.5 pb-4 text-[10px] transition-colors",
                active
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground",
              )}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span className="truncate max-w-[60px]">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={signOut}
          className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-4 text-[10px] text-muted-foreground transition-colors"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Exit</span>
        </button>
      </nav>
    </>
  );
}
