import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  const oauthError = searchParams.get('error_description')
  if (oauthError) {
    console.error('OAuth error from provider:', oauthError)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(oauthError)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`)
    console.error('Code exchange failed:', error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  console.error('No code in callback URL:', request.url)
  return NextResponse.redirect(`${origin}/login?error=No%20code%20returned`)
}