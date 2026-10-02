import SignInButton from '@/components/SignInButton'

export default async function Login({ searchParams }) {
  const sp = await searchParams
  return (
    <div className="narrow">
      <h1>Sign in</h1>
      {sp.error && <p className="error">Sign-in failed: {sp.error}</p>}
      <SignInButton />
    </div>
  )
}
