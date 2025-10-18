"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { ChevronDown, LayoutDashboard, ListTodo, Map, FileText, Activity } from "lucide-react";

export function QuickLinksDropdown() {
  const pathname = usePathname();

  const quickLinks = [
    {
      label: "Dashboard Home",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Todos",
      href: "/dashboard/todos",
      icon: ListTodo,
    },
    {
      label: "My Roadmaps",
      href: "/dashboard/roadmaps",
      icon: Map,
    },
    {
      label: "My Assessments",
      href: "/dashboard/assessments",
      icon: FileText,
    },
    {
      label: "Progress Tracking",
      href: "/dashboard/progress",
      icon: Activity,
    },
  ];

  const isActiveRoute = (route: string) => {
    return pathname === route || pathname.startsWith(route + "/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="font-normal gap-1">
          Dashboard
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Quick Links</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {quickLinks.map((link) => {
          const Icon = link.icon;
          const isActive = isActiveRoute(link.href);

          return (
            <DropdownMenuItem key={link.href} asChild>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  isActive && "bg-accent text-accent-foreground font-medium"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
