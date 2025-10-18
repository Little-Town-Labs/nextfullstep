"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface BreadcrumbRoute {
  label: string;
  href?: string;
}

// Custom labels for specific routes
const routeLabels: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/onboarding": "Onboarding",
  "/careers": "Career Paths",
  "/assessment": "Assessment",
  "/roadmap": "Roadmap",
  "/pricing": "Pricing",
  "/about": "About",
  "/admin": "Admin Dashboard",
  "/admin/users": "User Management",
  "/admin/models": "AI Models",
  "/admin/analytics": "Analytics",
  "/admin/audit-logs": "Audit Logs",
  "/dashboard/todos": "My Todos",
};

// Function to format dynamic segments (like IDs)
function formatDynamicSegment(segment: string): string {
  // Check if it looks like a UUID
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  ) {
    return `${segment.substring(0, 8)}...`;
  }

  // Otherwise, capitalize and format
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Generate breadcrumb items from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbRoute[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbRoute[] = [];

  // Always add home
  breadcrumbs.push({
    label: "Home",
    href: "/",
  });

  // Build breadcrumbs from path segments
  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Get custom label or format the segment
    const label =
      routeLabels[currentPath] || formatDynamicSegment(segment);

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on home page
  if (pathname === "/") {
    return null;
  }

  const breadcrumbs = generateBreadcrumbs(pathname);

  // Don't show if only one item (home)
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isHome = index === 0;

          return (
            <BreadcrumbItem key={crumb.href || crumb.label}>
              {!isLast && crumb.href ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href} className="flex items-center gap-2">
                      {isHome && <Home className="h-4 w-4" />}
                      <span>{crumb.label}</span>
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbPage className="flex items-center gap-2">
                  {isHome && <Home className="h-4 w-4" />}
                  <span>{crumb.label}</span>
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
