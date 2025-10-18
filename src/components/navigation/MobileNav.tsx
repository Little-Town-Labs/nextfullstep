"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Home, Briefcase, DollarSign, LayoutDashboard, Shield } from "lucide-react";

interface MobileNavProps {
  isAdmin?: boolean;
  isSignedIn?: boolean;
}

export function MobileNav({ isAdmin, isSignedIn }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const isActiveRoute = (route: string) => {
    return pathname === route || pathname.startsWith(route + "/");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActiveRoute("/")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            href="/careers"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActiveRoute("/careers")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Briefcase className="h-5 w-5" />
            <span className="font-medium">Career Paths</span>
          </Link>

          {isSignedIn && (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActiveRoute("/dashboard")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActiveRoute("/admin")
                  ? "bg-purple-600 text-white"
                  : "hover:bg-purple-50 text-purple-600"
              )}
            >
              <Shield className="h-5 w-5" />
              <span className="font-medium">Admin</span>
            </Link>
          )}

          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActiveRoute("/pricing")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <DollarSign className="h-5 w-5" />
            <span className="font-medium">Pricing</span>
          </Link>

          {!isSignedIn && (
            <>
              <div className="border-t my-4" />
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
