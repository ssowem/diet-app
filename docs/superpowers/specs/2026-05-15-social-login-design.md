# Social Login Design

## Goal

Replace the MVP email-entry gate with real social login entry points for Google, Kakao, and Naver.

## Approach

The app will use Supabase Auth in the browser with `@supabase/supabase-js`. Google and Kakao use built-in Supabase OAuth provider identifiers. Naver uses a Supabase custom OAuth provider identifier, `custom:naver`, because it is not a built-in provider.

## Runtime Behavior

If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing, the login page shows the social provider buttons disabled and explains that social login setup is required. If configured, clicking a provider calls `supabase.auth.signInWithOAuth` and redirects back to the app root. Once Supabase returns a session, the app derives the local profile id from the Supabase user id and keeps the existing local-first daily record storage scoped to that user.

## Scope

This change does not add cloud data sync, server-side storage, or paid subscription logic. Existing daily records remain in browser storage. The only auth backend added is Supabase Auth session management.

## Testing

Unit tests cover the visible social-login gate, missing configuration state, provider click behavior, and session-to-profile mapping. Existing Today, storage, completion, reminder, and build checks must keep passing.
