import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { initializeDatabase } from '@/lib/data-source';

// Initialize database connection once at startup
// This is safe because middleware runs once when the server starts
initializeDatabase().catch((error) => {
  console.error('Failed to initialize database at startup:', error);
});

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/careers',
  '/pricing',
  '/about',
  '/api/seed',
  '/api/test-db',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
