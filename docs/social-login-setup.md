# Social Login Setup

The app uses Supabase Auth for Google, Kakao, and Naver login.

## GitHub Pages Build Variables

Add these repository variables in GitHub:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The Pages workflow passes those variables into the Vite build.

## Supabase Redirect URLs

Add these URLs to the Supabase Auth redirect allow list:

- `https://ssowem.github.io/diet-app/`
- `http://127.0.0.1:5173/`

## Provider Setup

Enable Google and Kakao in Supabase Auth providers.

For Naver, create a custom OAuth provider with identifier `custom:naver`:

- Authorization URL: `https://nid.naver.com/oauth2.0/authorize`
- Token URL: `https://nid.naver.com/oauth2.0/token`
- UserInfo URL: `https://openapi.naver.com/v1/nid/me`

Use the Supabase provider callback URL shown in the Supabase dashboard as the callback URL in Google, Kakao, and Naver developer consoles.
