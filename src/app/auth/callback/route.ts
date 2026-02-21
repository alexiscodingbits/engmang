import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { ensureUser } from '@/lib/supabase/ensure-user'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Supabase forwards its own errors as query params
  if (errorParam) {
    console.error('[auth/callback] Supabase error param:', errorParam, errorDescription)
    return NextResponse.redirect(new URL('/auth/confirm?error=true', request.url))
  }

  if (!code) {
    console.error('[auth/callback] No code in callback URL. Received params:', Object.fromEntries(searchParams))
    return NextResponse.redirect(new URL('/auth/confirm?error=true', request.url))
  }

  // Capture cookies Supabase wants to write so we can attach them to the response.
  // In a Route Handler, cookies must be set on the NextResponse — not via cookieStore.set().
  type CookieEntry = { name: string; value: string; options?: Record<string, unknown> }
  const cookiesToSet: CookieEntry[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(entries) {
          entries.forEach((entry) => cookiesToSet.push(entry))
        },
      },
    }
  )

  const { data: { user }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message)
    return NextResponse.redirect(new URL('/auth/confirm?error=true', request.url))
  }

  if (!user) {
    console.error('[auth/callback] exchangeCodeForSession succeeded but returned no user')
    return NextResponse.redirect(new URL('/auth/confirm?error=true', request.url))
  }

  await ensureUser(user)

  // Always redirect to /feed — feed/page.tsx handles the /welcome redirect for new users
  const response = NextResponse.redirect(new URL('/feed', request.url))

  // Attach the Supabase session cookies to the redirect response
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })

  return response
}
