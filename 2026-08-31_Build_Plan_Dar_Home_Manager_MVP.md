# Dar: MVP Build Plan

Repo: `contactbrother/homemanager`
Supabase project: `jqeuxnkvmhhuvcrorcgh`
Method: Spec-Driven Development using GitHub Spec Kit
Status: Draft for build, August 2026

---

## 1. What Dar is

Dar is a personal home manager for villa families in Dubai.

A villa owner drops any task on us, a voice note or a text, and we handle it: get quotes, supervise vendors, track every contract and renewal, report back with photos. This app is the client's window into that service. It is not the service itself.

**MVP goal:** replace the WhatsApp and spreadsheet workflow with one place where a client sees their property, their documents, what is due, and the status of everything they asked us to do.

**Who uses it**
- **Client**: a villa owner or tenant. Uses it on a phone, one handed, a few times a month.
- **Admin**: us. Uses it on a laptop, daily, to see incoming tasks and manage documents.

---

## 2. Spec Kit workflow

Spec Kit runs in five steps. Each heading below is the text to paste into the matching command inside Codespaces once `specify init` has run.

Install first:

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z
specify init . --integration claude
```

Use the latest release tag from the Spec Kit releases page in place of `vX.Y.Z`.

### 2.1 `/speckit.constitution`

```
Create principles for a small client-facing product where trust matters more than features.

1. Calm over busy. One primary action per screen. If a screen has two equally weighted buttons, the design is wrong.
2. Every feature must serve a real client task. No feature ships without a screen a client actually reaches.
3. Mobile first. Every screen is designed for a phone held in one hand, then adapted upward.
4. Client data is private by default. Row level security on every table, no exceptions, no shortcuts for convenience.
5. Simple over clever. Prefer boring, readable code and framework defaults over abstraction. A new developer should understand any file in two minutes.
6. Extensible by structure, not by prediction. Organise code by feature folder so new features are added, never retrofitted, but do not build for features that are not specified.
7. Nothing blocks on the network. Optimistic updates, skeletons instead of spinners, and the interface never shows a dead state.
8. Honest states. Empty means empty and says so plainly. Errors say what happened and what to do next.
```

### 2.2 `/speckit.specify`

```
Build a web app called Dar where villa owners in Dubai see everything about their home in one place, and where the team managing their home can respond.

A client signs in with their email and receives a link, no password to remember. On first sign in their villa has already been set up for them by the team, so they see their home immediately rather than an empty app.

The home screen tells them whether anything needs attention. If nothing is due and no task is waiting, it says so plainly. If a document expires soon, a contract is up for renewal, or a task they raised has moved forward, it appears here in the order that matters, soonest first.

The property screen shows their villa: name, community, address and a photo. Inside it is the record of the home, every document held for that property, each with a type, an expiry date if it has one, and the file itself. The client can open or download any document. They can also upload one, choose what kind it is, and set when it expires. Documents with no expiry, like a floor plan, are supported too.

Documents that are expiring soon are marked clearly. Documents that have expired are marked more clearly still. Everything else stays quiet.

The tasks screen is where the client asks for things. They write what they need, or record a voice note, and send it. Each task shows its current status: received, in progress, waiting on the client, or done. The client can open a task to see its history and add a note. They never have to categorise or organise anything, that is our job.

A client may have more than one property. If they do, the property screen lists them and each task and document belongs to one property.

Separately, the team has an admin area. It lists all clients, lets the team create a client and their property, upload documents on the client's behalf, see every incoming task across all clients, change a task's status and reply to it. The admin area is plain and functional, it does not need to be beautiful.

Success looks like this: a client with a question about their home opens Dar instead of scrolling WhatsApp, and finds the answer in under ten seconds.
```

### 2.3 `/speckit.plan`

```
Next.js with the App Router and TypeScript. Tailwind CSS for styling. Supabase for authentication, database and file storage. Deployed on Vercel. Developed in GitHub Codespaces.

Authentication is Supabase magic link email sign in. There are two roles, client and admin, stored on a profiles table. Route groups separate the client app from the admin app and each is protected by middleware that checks the session and the role.

All data access goes through Supabase row level security. A client can read and write only rows belonging to them. Admins can read and write everything. The frontend uses the anon key only. The service role key is used exclusively in server side code for admin operations and is never exposed to the browser.

Files are stored in a private Supabase Storage bucket. Files are never public. The app serves them through signed URLs generated on request and valid for a short period.

Code is organised by feature, not by file type. Each feature folder holds its own components, queries and types so a new feature is added as a new folder rather than edits spread across the codebase. Shared UI primitives live in one place and are used everywhere.

Server Components fetch data by default. Client Components are used only where interaction requires it. Mutations are Server Actions. Interface updates optimistically and reconciles when the server responds.

No state management library, no component library, no ORM. Supabase client and framework primitives only.
```

### 2.4 `/speckit.tasks`

Run `/speckit.tasks` with no arguments after the plan is accepted. Then `/speckit.analyze` before implementing, and `/speckit.implement` to build.

Expected phases, in order:

1. Project setup, Supabase client, environment variables, Tailwind and design tokens
2. Database schema and RLS policies applied in Supabase
3. Authentication: magic link sign in, session middleware, role routing
4. Shared UI primitives: button, card, status pill, sheet, empty state, skeleton
5. Property feature: list, detail, document list
6. Documents feature: upload, expiry logic, signed URL download
7. Tasks feature: create with text and voice, list, detail, status
8. Dashboard: attention items assembled from documents and tasks
9. Admin area: clients, properties, documents, task queue
10. Polish: motion, haptics, empty states, error states

---

## 3. Data model

Six tables. Small on purpose. Every table carries `created_at` and belongs to an owner so RLS is simple.

| Table | Holds |
|---|---|
| `profiles` | one row per user, extends Supabase auth, carries the role |
| `properties` | a villa, belongs to a profile |
| `documents` | a file plus its type and expiry, belongs to a property |
| `tasks` | a client request, belongs to a property |
| `task_messages` | the conversation on a task |
| `service_records` | work done on a property, for the villa history |

`service_records` is in the schema but not in the MVP screens. It exists so the "Record" pillar of the business has a home when we build it, and costs nothing to create now.

### 3.1 SQL: schema

Paste into the Supabase SQL editor, in order.

```sql
-- ============================================
-- Dar schema
-- ============================================

create type user_role as enum ('client', 'admin');

create type document_type as enum (
  'amc', 'ejari', 'insurance', 'visa', 'emirates_id',
  'passport', 'vehicle', 'utility', 'warranty', 'other'
);

create type task_status as enum (
  'received', 'in_progress', 'waiting_on_client', 'done', 'cancelled'
);

-- Profiles: one per auth user
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'client',
  created_at timestamptz not null default now()
);

-- Properties
create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  community text,
  address text,
  photo_path text,
  created_at timestamptz not null default now()
);

create index properties_owner_idx on properties(owner_id);

-- Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  uploaded_by uuid not null references profiles(id),
  title text not null,
  doc_type document_type not null default 'other',
  file_path text not null,
  file_size bigint,
  mime_type text,
  expires_on date,
  notes text,
  created_at timestamptz not null default now()
);

create index documents_property_idx on documents(property_id);
create index documents_expiry_idx on documents(expires_on) where expires_on is not null;

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  created_by uuid not null references profiles(id),
  title text not null,
  body text,
  voice_path text,
  status task_status not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_property_idx on tasks(property_id);
create index tasks_status_idx on tasks(status);

-- Task messages
create table task_messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  author_id uuid not null references profiles(id),
  body text,
  voice_path text,
  created_at timestamptz not null default now()
);

create index task_messages_task_idx on task_messages(task_id);

-- Service records (schema only in MVP)
create table service_records (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  performed_on date not null,
  vendor_name text,
  summary text not null,
  cost_aed numeric(10,2),
  created_at timestamptz not null default now()
);

create index service_records_property_idx on service_records(property_id);

-- Keep tasks.updated_at current
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger tasks_touch_updated_at
  before update on tasks
  for each row execute function touch_updated_at();

-- Create a profile automatically on sign up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

### 3.2 SQL: row level security

Nothing is readable until a policy allows it. Apply all of this.

```sql
-- ============================================
-- Row level security
-- ============================================

alter table profiles        enable row level security;
alter table properties      enable row level security;
alter table documents       enable row level security;
alter table tasks           enable row level security;
alter table task_messages   enable row level security;
alter table service_records enable row level security;

-- Helper: is the current user an admin
create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles
create policy "read own profile"
  on profiles for select using (id = auth.uid() or is_admin());

create policy "update own profile"
  on profiles for update using (id = auth.uid() or is_admin());

-- Properties
create policy "read own properties"
  on properties for select using (owner_id = auth.uid() or is_admin());

create policy "admin writes properties"
  on properties for insert with check (is_admin());

create policy "admin updates properties"
  on properties for update using (is_admin());

create policy "admin deletes properties"
  on properties for delete using (is_admin());

-- Documents
create policy "read own documents"
  on documents for select using (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "upload to own property"
  on documents for insert with check (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "update own documents"
  on documents for update using (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "delete own documents"
  on documents for delete using (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

-- Tasks
create policy "read own tasks"
  on tasks for select using (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "create own tasks"
  on tasks for insert with check (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "admin updates tasks"
  on tasks for update using (is_admin());

-- Task messages
create policy "read messages on own tasks"
  on task_messages for select using (
    is_admin() or task_id in (
      select t.id from tasks t
      join properties p on p.id = t.property_id
      where p.owner_id = auth.uid()
    )
  );

create policy "write messages on own tasks"
  on task_messages for insert with check (
    is_admin() or task_id in (
      select t.id from tasks t
      join properties p on p.id = t.property_id
      where p.owner_id = auth.uid()
    )
  );

-- Service records
create policy "read own service records"
  on service_records for select using (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "admin writes service records"
  on service_records for all using (is_admin()) with check (is_admin());
```

### 3.3 SQL: storage

One private bucket. Files are pathed by property so policies stay simple.

Path convention: `{property_id}/{document_or_task_id}/{filename}`

```sql
-- ============================================
-- Storage
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dar-files',
  'dar-files',
  false,
  20971520, -- 20 MB
  array[
    'application/pdf',
    'image/jpeg','image/png','image/heic','image/webp',
    'audio/webm','audio/mpeg','audio/mp4','audio/ogg'
  ]
)
on conflict (id) do nothing;

-- Read files belonging to your own property
create policy "read own files"
  on storage.objects for select using (
    bucket_id = 'dar-files' and (
      is_admin() or (storage.foldername(name))[1] in (
        select id::text from properties where owner_id = auth.uid()
      )
    )
  );

-- Upload into your own property folder
create policy "upload own files"
  on storage.objects for insert with check (
    bucket_id = 'dar-files' and (
      is_admin() or (storage.foldername(name))[1] in (
        select id::text from properties where owner_id = auth.uid()
      )
    )
  );

create policy "delete own files"
  on storage.objects for delete using (
    bucket_id = 'dar-files' and (
      is_admin() or (storage.foldername(name))[1] in (
        select id::text from properties where owner_id = auth.uid()
      )
    )
  );
```

### 3.4 Making yourself admin

After your first sign in, run this once with your own email:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'your@email.com');
```

---

## 4. Design system

Dar looks like the pitch deck. Same palette, same type, so a client who saw the concept recognises the product.

### 4.1 Tokens

```css
:root {
  /* Colour */
  --ink:        #132A24;  /* deep forest, primary text and dark surfaces */
  --ink-soft:   #3C4B45;  /* secondary text */
  --gold:       #B8894A;  /* accent, primary action FILL ONLY, never text or icons */
  --gold-text:  #8F6631;  /* the same gold, darkened for text and icons on light */
  --ivory:      #F7F3EC;  /* app background */
  --surface:    #FFFFFF;  /* cards */
  --line:       #E2DACB;  /* borders, dividers, decorative only */
  --mute:       #63706B;  /* tertiary text */

  /* Status, used sparingly */
  --ok:      #2F6F52;
  --warn:    #8F6631;   /* same gold as --gold-text, deliberate */
  --alert:   #A4462F;

  /* Radius */
  --r-sm: 8px;
  --r-md: 14px;
  --r-lg: 20px;

  /* Spacing scale: 4 8 12 16 24 32 48 64 */

  /* Motion */
  --ease: cubic-bezier(0.32, 0.72, 0, 1);
  --fast: 180ms;
  --base: 260ms;
}
```

**Contrast, resolved 31 August 2026.** The palette as first drafted failed WCAG 2.2 AA in
four places, which FR-053 of the specification requires it to meet. Measured ratios and the
resolution:

| Use | As drafted | Resolved |
|---|---|---|
| Label on the primary gold button | white on `--gold`, 3.13 | `--ink` on `--gold`, **4.85** |
| Pressed state of that button | white on `--gold-deep`, 4.47 | expressed by scale, not colour; `--gold-deep` deleted |
| Gold as text or icon on ivory | `--gold`, 2.83 | `--gold-text` `#8F6631`, **4.62** |
| Tertiary text on ivory | `#6E7B76`, 3.99 | `--mute` `#63706B`, **4.68** |

`--warn` moved with `--gold-text` for the same reason: as a text and pill colour the
original gold failed at 2.83. Unchanged and passing: `--ink` on ivory 13.71, `--ink` on
white 15.17, `--ink-soft` 8.31, `--ok` 5.40, `--alert` 5.43. `--line` at 1.26 is decorative,
since a card is distinguished by its white fill rather than by its border, so no contrast
minimum applies to it.

### 4.2 Type

- **Fraunces** for headings and numbers. Loaded via `next/font/google`, weights 400 and 600.
- **Inter** for everything else. Weights 400, 500, 600.
- Scale: 32 / 24 / 20 / 17 / 15 / 13 / 11. Body is 15 on mobile, 16 on desktop.
- Line height 1.5 for body, 1.2 for headings.

### 4.3 Rules

- One primary action per screen. Filled `--gold`, label in `--ink`. Everything else is text or outline.
- The pressed state of the primary action is expressed by scale, not by darkening. There is no darker gold background.
- Gold as text or an icon uses `--gold-text`. `--gold` is a fill colour only.
- Cards on ivory: white, radius `--r-md`, 1px `--line` border, no shadow. Shadow only on sheets and floating elements.
- Status colour appears only when something is genuinely due or wrong. A healthy screen has no colour beyond gold.
- Minimum tap target 44px. Primary actions sit in the lower third, thumb reachable.
- Empty states are sentences, not illustrations: "Nothing needs your attention." "No documents yet."

### 4.4 Interaction

- Motion: spring easing, `--base` for entrances, `--fast` for taps. Elements scale and settle, they do not slide in from off screen.
- Optimistic updates on every mutation. The interface responds instantly, the server catches up.
- Skeletons, never spinners. Match the shape of the content that is loading.
- Haptic feedback on submit and status change, via the Vibration API where supported.
- Bottom sheets for create and detail flows on mobile, not full page navigation.
- Pull to refresh on list screens.
- Voice note recording is one button, hold to record, release to send. It is the signature interaction of the product and should feel effortless.

---

## 5. Screens

**Client**

| Screen | Route | Shows |
|---|---|---|
| Sign in | `/sign-in` | Email field, magic link sent confirmation |
| Home | `/` | Attention items, or a calm empty state. Quick action to raise a task |
| Properties | `/properties` | Card per property. Skipped straight to detail if only one |
| Property | `/properties/[id]` | Photo, details, document list, recent tasks |
| Upload | sheet | File picker, type, title, expiry date |
| Tasks | `/tasks` | Open tasks first, then done |
| New task | sheet | Text field, voice record button, property selector if more than one |
| Task | `/tasks/[id]` | Status, history, add a note |
| Profile | `/profile` | Name, phone, sign out |

**Admin**

| Screen | Route | Shows |
|---|---|---|
| Clients | `/admin` | List, create client and property |
| Client | `/admin/clients/[id]` | Their properties, documents, tasks |
| Task queue | `/admin/tasks` | Every task across clients, filter by status |
| Task | `/admin/tasks/[id]` | Change status, reply |

---

## 6. Folder structure

Organised by feature so a new feature is a new folder, never a rewrite.

```
homemanager/
├── app/
│   ├── (auth)/
│   │   └── sign-in/page.tsx
│   ├── (client)/
│   │   ├── layout.tsx              # nav, session guard
│   │   ├── page.tsx                # home
│   │   ├── properties/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── profile/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx          # admin role guard
│   │       ├── page.tsx
│   │       ├── clients/[id]/page.tsx
│   │       └── tasks/
│   │           ├── page.tsx
│   │           └── [id]/page.tsx
│   ├── layout.tsx                  # fonts, tokens
│   └── globals.css
│
├── features/                       # one folder per feature
│   ├── properties/
│   │   ├── components/
│   │   ├── queries.ts              # reads
│   │   ├── actions.ts              # Server Actions
│   │   └── types.ts
│   ├── documents/
│   │   ├── components/
│   │   ├── queries.ts
│   │   ├── actions.ts              # upload, signed URL, delete
│   │   ├── expiry.ts               # due soon and expired logic
│   │   └── types.ts
│   ├── tasks/
│   │   ├── components/
│   │   ├── queries.ts
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── dashboard/
│   │   └── attention.ts            # assembles the home screen list
│   └── auth/
│       ├── actions.ts
│       └── guards.ts
│
├── components/ui/                  # shared primitives only
│   ├── button.tsx
│   ├── card.tsx
│   ├── status-pill.tsx
│   ├── sheet.tsx
│   ├── empty-state.tsx
│   ├── skeleton.tsx
│   └── voice-recorder.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # browser, anon key
│   │   ├── server.ts               # server components, anon key + session
│   │   └── admin.ts                # service role, server only, never imported client side
│   ├── format.ts                   # dates as DD Month YYYY, AED amounts
│   └── constants.ts
│
├── middleware.ts                   # session refresh, role routing
├── .env.local                      # never committed
└── specs/                          # Spec Kit artefacts
```

**Rule for adding a feature later**: create `features/<name>/`, add its route folder, reuse `components/ui`. Nothing existing gets edited except the navigation.

---

## 7. Environment and setup

### 7.1 Environment variables

`.env.local` in Codespaces, and the same four in Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://jqeuxnkvmhhuvcrorcgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_SUPPORT_WHATSAPP=<support WhatsApp number in international format>
```

`NEXT_PUBLIC_SUPPORT_WHATSAPP` carries the contact route on the sign-in screen, required by
FR-052. It is public by design: the screen needs it before any session exists, and a support
number is not a secret. Where it is unset the contact route is hidden rather than rendered
broken.

**Security**: the service role key bypasses every policy above. It belongs only in `.env.local` and Vercel, never in the repo, never in a `NEXT_PUBLIC_` variable, never in a chat window. Rotate it in Supabase under Settings, API if it is ever exposed. `.env.local` must be listed in `.gitignore` before the first commit.

### 7.2 Codespaces

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install @supabase/supabase-js @supabase/ssr
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z
specify init . --integration claude
```

Then apply sections 3.1, 3.2 and 3.3 in the Supabase SQL editor, in that order.

### 7.3 Vercel deployment

1. Import `contactbrother/homemanager` in Vercel, framework detected as Next.js
2. Add the four environment variables above
3. Deploy, note the URL
4. In Supabase, Authentication, URL Configuration: set Site URL to the Vercel URL and add `<vercel-url>/**` to redirect URLs, or magic links will fail
5. Test sign in on a phone before anything else

---

## 8. Out of MVP

Deliberately excluded. Each is a later feature folder, not a rewrite.

- Payments and subscription billing
- Push notifications and email or WhatsApp reminders
- Vendor portal and quote comparison inside the app
- Group deals and neighbourhood pricing
- Photo report builder
- Service history screens, the table exists, the screens do not
- Multi language, English only for now
- Native mobile apps

---

## 9. Definition of done for the MVP

- A client signs in on a phone with a magic link and reaches their property in under ten seconds
- They can upload a document with an expiry, and it appears on the home screen as it approaches
- They can raise a task by voice note and watch its status change
- An admin can create a client and property, see every incoming task and respond
- No client can see another client's data, verified by signing in as two clients
- Deployed on Vercel and usable on a phone, not just a laptop
