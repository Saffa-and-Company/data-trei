import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname

  // Define paths to exclude from middleware
  const excludedPaths = [
    '/api/github/webhook', // Exact webhook path
    '/api/github/webhook/*', // Any subpaths under webhook
    '/api/webhook/log', // If you have other webhook endpoints
    '/api/webhook/log/*',
    '/api/gcp/log-ingestion/*',
    '/api/gcp/log-ingestion',
   
  ]

  // Check if the request path starts with any excluded path
  const isExcluded = excludedPaths.some((path) =>
    url === path || url.startsWith(path + '/')
  )

  if (isExcluded) {
    return NextResponse.next()
  }

  // Apply the existing session update logic
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - /api/github/webhook
     * - /api/webhook/log
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/github/webhook|api/webhook/log).*)',
  ],
}