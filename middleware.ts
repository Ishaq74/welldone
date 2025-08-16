import { auth } from "@lib/auth";
import { defineMiddleware } from "astro:middleware";

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  // Admin routes - require admin role
  '/admin': ['admin'],
  '/api/admin': ['admin'],
  
  // User routes - require any authenticated user
  '/profil': ['admin', 'user', 'member'],
  '/api/user': ['admin', 'user', 'member'],
  
  // API routes that need authentication
  '/api/protected': ['admin', 'user', 'member']
};

// Routes that are always accessible (public)
const PUBLIC_ROUTES = [
  '/',
  '/api/auth',
  '/login',
  '/register'
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return roles;
    }
  }
  return null;
}

function isUserBanned(user: any): boolean {
  if (!user) return false;
  
  // Check if user is banned
  if (user.banned) {
    // If no expiration date, ban is permanent
    if (!user.banExpires) return true;
    
    // Check if ban has expired
    const now = new Date();
    const banExpires = new Date(user.banExpires);
    return now < banExpires;
  }
  
  return false;
}

export const onRequest = defineMiddleware(async (context, next) => {
    const pathname = context.url.pathname;
    
    // Get session information
    const isAuthed = await auth.api
        .getSession({
            headers: context.request.headers,
        });

    if (isAuthed) {
        context.locals.user = isAuthed.user;
        context.locals.session = isAuthed.session;
    } else {
        context.locals.user = null;
        context.locals.session = null;
    }

    // Check if route is public
    if (isPublicRoute(pathname)) {
        return next();
    }

    // Check if route requires authentication
    const requiredRoles = getRequiredRoles(pathname);
    
    if (requiredRoles !== null) {
        // Route requires authentication
        if (!isAuthed || !isAuthed.user) {
            // Not authenticated
            if (pathname.startsWith('/api/')) {
                return new Response(
                    JSON.stringify({ error: 'Authentification requise' }), 
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                // Redirect to login for pages
                return Response.redirect(new URL('/login', context.url), 302);
            }
        }

        // Check if user is banned
        if (isUserBanned(isAuthed.user)) {
            if (pathname.startsWith('/api/')) {
                return new Response(
                    JSON.stringify({ error: 'Compte suspendu' }), 
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                return Response.redirect(new URL('/banned', context.url), 302);
            }
        }

        // Check role authorization
        const userRole = isAuthed.user.role || 'user';
        if (!requiredRoles.includes(userRole)) {
            // Insufficient permissions
            if (pathname.startsWith('/api/')) {
                return new Response(
                    JSON.stringify({ error: 'Permissions insuffisantes' }), 
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                return Response.redirect(new URL('/unauthorized', context.url), 302);
            }
        }
    }

    return next();
});