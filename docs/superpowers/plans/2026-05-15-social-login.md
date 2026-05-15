# Social Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual email login with Google, Kakao, and Naver social login powered by Supabase Auth.

**Architecture:** Add a small Supabase client boundary, replace `useLocalSession` with an auth-session hook, and render provider buttons through `AuthGate`. Existing daily record storage stays local-first and is scoped by Supabase user id.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, Testing Library, Supabase JS.

---

## File Structure

- Create `src/auth/supabaseClient.ts`: owns environment parsing and lazy Supabase client creation.
- Create `src/hooks/useAuthSession.ts`: subscribes to Supabase Auth session changes and exposes `session`, `signInWithProvider`, and `logout`.
- Modify `src/components/AuthGate.tsx`: replaces email form with Google, Kakao, and Naver OAuth buttons plus configuration messaging.
- Modify `src/App.tsx`: uses the new auth hook and passes provider sign-in to the auth gate.
- Modify `src/App.test.tsx`: verifies the social-login gate and logged-in app behavior.
- Add `src/hooks/useAuthSession.test.tsx`: tests auth state mapping without hitting real Supabase.
- Add `.env.example`: documents required Supabase client env vars.
- Modify `package.json` and `package-lock.json`: add `@supabase/supabase-js`.

### Task 1: Auth Gate RED Tests

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/components/AuthGate.tsx`

- [ ] **Step 1: Write failing app tests**

Add assertions that the logged-out app shows buttons named `Google로 계속하기`, `카카오로 계속하기`, and `네이버로 계속하기`, and does not show the email input.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because the current login gate still renders an email textbox and lacks social provider buttons.

### Task 2: Supabase Session Hook RED Tests

**Files:**
- Create: `src/hooks/useAuthSession.test.tsx`
- Create: `src/hooks/useAuthSession.ts`
- Create: `src/auth/supabaseClient.ts`

- [ ] **Step 1: Write failing hook tests**

Test that missing Supabase config sets `isConfigured` to `false`, an existing Supabase user becomes `{ email, profileId }`, and `signInWithProvider("naver")` calls Supabase with provider `custom:naver`.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- src/hooks/useAuthSession.test.tsx`

Expected: FAIL because `useAuthSession` and `supabaseClient` do not exist yet.

### Task 3: Implement Supabase Auth Boundary

**Files:**
- Create: `src/auth/supabaseClient.ts`
- Create: `src/hooks/useAuthSession.ts`
- Add dependency: `@supabase/supabase-js`

- [ ] **Step 1: Install dependency**

Run: `npm install @supabase/supabase-js`

- [ ] **Step 2: Implement client and hook**

`supabaseClient.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. `useAuthSession.ts` maps Supabase session user id to profile id `supabase-${user.id}` and maps providers as `google`, `kakao`, and `custom:naver`.

- [ ] **Step 3: Verify hook tests pass**

Run: `npm test -- src/hooks/useAuthSession.test.tsx`

Expected: PASS.

### Task 4: Replace Email UI With Social Buttons

**Files:**
- Modify: `src/components/AuthGate.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Implement social auth UI**

Replace the email form with three provider buttons and disabled explanatory state when Supabase config is absent.

- [ ] **Step 2: Wire app to new hook**

Replace `useLocalSession` with `useAuthSession` in `App.tsx`. Keep `logout` behavior and existing authenticated app rendering.

- [ ] **Step 3: Verify app tests pass**

Run: `npm test -- src/App.test.tsx src/hooks/useAuthSession.test.tsx`

Expected: PASS.

### Task 5: Env Docs, Full Verification, Deploy

**Files:**
- Create: `.env.example`
- Modify: package files from dependency install

- [ ] **Step 1: Add env example**

Create `.env.example` with `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=`.

- [ ] **Step 2: Run full checks**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build -- --base=/diet-app/`

Expected: production build PASS.

- [ ] **Step 3: Commit and push**

Commit message: `feat: add supabase social login`

Push: `git push origin main`

- [ ] **Step 4: Verify deployment**

Confirm GitHub Pages workflow succeeds and `https://ssowem.github.io/diet-app/` serves the new social-login UI.
