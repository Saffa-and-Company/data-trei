import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname

  const excludedPaths = [
    '/api/github/webhook',
    '/api/webhook/log',
    '/api/gcp/log-ingestion', // Exclude GCP log ingestion
    '/api/gcp/log-ingestion/*', // Any subpaths
  ]

  const isExcluded = excludedPaths.some((path) =>
    url === path || url.startsWith(path + '/')
  )

  if (isExcluded) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/github/webhook|api/webhook/log|api/gcp/log-ingestion).*)',
  ],
}