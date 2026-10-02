# Plumline: Next.js shop with Supabase, Google sign-in and Mailgun

Flow: sign in with Google → browse → cart → checkout → order saved in Postgres → confirmation email via Mailgun.

## 1. Supabase (database + auth)
1. Create a project at supabase.com.
2. SQL Editor → paste and run `supabase/schema.sql` (tables, row-level security, 8 sample products).
3. Project Settings → API: copy the Project URL, `anon` key and `service_role` key into `.env.local`.

## 2. Google sign-in (Google Cloud Console)
1. console.cloud.google.com → create a project.
2. APIs & Services → OAuth consent screen: set it up (External), add your email as a test user.
3. Credentials → Create credentials → OAuth client ID → Web application.
4. Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
   (Authorized JavaScript origin: `http://localhost:3000` and your deployed URL.)
5. Copy the Client ID and Client Secret.
6. Supabase → Authentication → Providers → Google: enable it and paste both values.
7. Supabase → Authentication → URL Configuration: Site URL `http://localhost:3000`;
   add Redirect URLs `http://localhost:3000/auth/callback` and `https://YOUR-DEPLOYED-URL/auth/callback`.

## 3. Mailgun
1. Sign up at mailgun.com. Use the sandbox domain for testing, or add your own domain.
2. Sandbox domains only send to authorized recipients: Sending → Domain settings → Authorized Recipients → add the Gmail you'll test with and confirm the email Mailgun sends.
3. Copy your Private API key and domain into `.env.local`. Use `MAILGUN_API_BASE=https://api.eu.mailgun.net` for EU accounts.

## 4. Run
```
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## Deploy (Vercel)
Import the repo, add the same env vars (set `NEXT_PUBLIC_SITE_URL` to your URL), then add the Vercel URL to Supabase's redirect URLs and Google's JavaScript origins.

## Notes
- Prices are re-read from the database on the server at checkout; the browser can't set them.
- Orders are written with the service-role key in `app/api/checkout/route.js`. RLS lets customers read only their own orders.
- If the email fails, the order is still saved (`orders.email_sent` records the result).
- The cart is kept in the browser's localStorage until checkout; everything after that is in the database.
