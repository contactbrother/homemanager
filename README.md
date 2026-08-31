# Dar

A personal home manager for villa families in Dubai. This app is the client's window into
the service: their property, the documents held for it, what is expiring, and the status of
everything they have asked the team to do.

Built with Spec-Driven Development. The specification, plan and task list live in
[`specs/001-dar-home-manager/`](specs/001-dar-home-manager/) and the governing principles in
[`.specify/memory/constitution.md`](.specify/memory/constitution.md). Read the spec before
changing behaviour: the requirements are numbered and the code cites them.

## Running it

```bash
npm install
npm run dev
```

Four environment variables in `.env.local`, and the same four in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPPORT_WHATSAPP
```

The service role key bypasses every row level security policy. It belongs in `.env.local`
and Vercel only: never in the repository, never in a `NEXT_PUBLIC_` variable, never in a
chat window.

## Database

Apply `supabase/migrations/` in filename order in the Supabase SQL editor, as project owner.
Then set three things under Authentication that no migration can carry: email OTP expiry to
900 seconds, email rate limit to 5 per hour per address, and Site URL plus `<url>/**` in
redirect URLs. Full walkthrough in
[`specs/001-dar-home-manager/quickstart.md`](specs/001-dar-home-manager/quickstart.md).

## Checks

```bash
npm run build      # type check and production build
npm run audit      # contrast, one-primary-action, keyboard, states, copy
npm run test:e2e   # Playwright: sign-in journey and cross-client isolation
```

The isolation tests need two real client sessions and seeded data, so they skip unless the
`E2E_*` variables named in `e2e/isolation.spec.ts` are set. They skip rather than pass
vacuously, which is the point.

## Structure

`app/` routes in two groups, client and admin. `features/` one folder per feature, each with
its own components, queries, actions and types. `components/ui/` shared primitives.
`lib/supabase/` three clients: browser and server on the anon key, and an admin client whose
service role is confined to inviting, banning and unbanning users.
