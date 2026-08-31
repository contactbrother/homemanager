# Feature Specification: Dar Home Manager MVP

**Feature Branch**: `main` (no feature branch created; spec directory `001-dar-home-manager`)

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Build a web app called Dar where villa owners in Dubai see everything about their home in one place, and where the team managing their home can respond." (full text in `2026-08-31_Build_Plan_Dar_Home_Manager_MVP.md`, section 2.2)

## Clarifications

### Session 2026-08-31

- Q: How long should a sign-in link stay valid, and how many can one email address request in an hour? → A: 15 minute lifetime, single use, 5 requests per address per hour, with an identical on-screen response whether or not the address is registered
- Q: When a client leaves the service, what happens to the documents Dar holds for them? → A: The team deactivates the client, access stops immediately, and all files and records are permanently deleted 90 days later. This is the stated policy. In this release only deactivation and the recording of the deactivation moment are built; the scheduled purge that acts on the 90 day clock is a named follow-up and is explicitly out of scope
- Q: Can a team member move a task's status freely in any direction, including reopening one already marked done? → A: Yes. Any status may move to any other, unrestricted, with every change recorded in the task history and visible to the client
- Q: Now that clients cannot delete documents, should they still be able to delete the underlying files in storage? → A: No. File deletion is a team action only, matching FR-019. The storage rules in 20260831000003_storage.sql were amended so a client cannot leave a document listed with nothing behind it
- Q: What should a client see when they enter their email, no link arrives, and they are stuck on the confirmation screen? → A: A resend control enabled after 60 seconds, a line telling them to check spam, and a contact route to the team. The contact route is a WhatsApp link, not email, since WhatsApp is the channel clients already use with the team

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Team sets up a client and their home (Priority: P1)

A member of the team receives a new client. In the admin area they create the client's
record from an email address, create the client's villa against that record with its name,
community, address and photo, and upload the documents the team already holds for that
home, each with a type and an expiry date where it has one. When the client first signs
in, their home is already there.

**Why this priority**: nothing else in the product is reachable until a client and a
property exist. The brief is explicit that a client must never meet an empty app, so this
journey is a precondition for every other one. It is also the only slice that can be
tested from a completely empty database.

**Independent Test**: can be fully tested by signing in as a team member, creating a
client and a property, uploading two documents (one with an expiry, one without), and
confirming both appear against that property. Delivers value on its own: the team's client
records move off spreadsheets into one system.

**Acceptance Scenarios**:

1. **Given** an empty system with one team member, **When** they create a client with an
   email address and a full name, **Then** the client appears in the client list and can
   be opened.
2. **Given** an existing client, **When** the team member creates a property against that
   client with a name, community, address and photo, **Then** the property is listed under
   that client and is owned by them.
3. **Given** an existing property, **When** the team member uploads a document with a
   title, a type and an expiry date, **Then** the document appears against that property
   with its type and expiry shown.
4. **Given** an existing property, **When** the team member uploads a document with no
   expiry date, such as a floor plan, **Then** the document is accepted and shown without
   an expiry.
5. **Given** a client who has never signed in, **When** they sign in for the first time,
   **Then** they see their property and its documents immediately, with no setup step.

---

### User Story 2 - Client finds an answer about their home (Priority: P2)

A villa owner standing in their home wants to know when their Ejari expires. They open
Dar on their phone, enter their email address, receive a sign-in link, tap it, and land on
their home. They reach their property, see the document list, and open the Ejari to read
it or download it.

**Why this priority**: this is the product's stated purpose and its success measure. A
client with a question opens Dar instead of scrolling WhatsApp and has the answer in under
ten seconds.

**Independent Test**: can be fully tested, once P1 has seeded a client and a property, by
signing in as that client on a phone viewport and timing the path from opening the app to
reading the document. Delivers the core value of the product.

**Acceptance Scenarios**:

1. **Given** a client whose email is registered, **When** they enter it on the sign-in
   screen, **Then** they are told a link has been sent, told to check their spam folder,
   and offered a WhatsApp route to the team.
2. **Given** a client on the confirmation screen whose link has not arrived, **When** 60
   seconds have passed, **Then** they can request another; **and before** 60 seconds have
   passed, **Then** the resend control is unavailable.
3. **Given** a client who taps a valid sign-in link, **When** the link opens, **Then**
   they are signed in and land on the home screen without entering a password.
4. **Given** a signed-in client with exactly one property, **When** they open the property
   area, **Then** they go straight to that property rather than a list of one.
5. **Given** a signed-in client with more than one property, **When** they open the
   property area, **Then** they see a card for each property and can choose one.
6. **Given** a client viewing their property, **When** they open a document, **Then** the
   file opens or downloads, and the link that served it stops working after a short period.
7. **Given** a client viewing their property, **When** they upload a document, choose its
   type and set an expiry, **Then** it appears in the document list straight away.
8. **Given** a client viewing a document list, **When** a document expires within the
   warning window, **Then** it is marked as expiring soon; **and when** a document is past
   its expiry date, **Then** it is marked more prominently as expired; **and** all other
   documents carry no status marking.
9. **Given** a client signed in as themselves, **When** they attempt to reach another
   client's property, document or task by any means, **Then** they are refused.

---

### User Story 3 - Client raises a task and follows it (Priority: P3)

A villa owner needs the air conditioning serviced. They open the tasks screen, either
type what they need or hold a button to record a voice note, and send it. The task appears
immediately as received. Over the following days its status changes as the team works on
it, and the client can open it to read the history and add a note.

**Why this priority**: this is the second pillar of the service and the reason the client
stops using WhatsApp. It depends on a property existing but not on documents.

**Independent Test**: can be fully tested by signing in as a client, raising one task by
text and one by voice note, confirming both show as received, and confirming a note added
to a task appears in its history.

**Acceptance Scenarios**:

1. **Given** a signed-in client, **When** they write what they need and send it, **Then**
   the task appears at the top of their task list with the status received.
2. **Given** a signed-in client, **When** they hold the record button, speak, and release,
   **Then** a voice note is attached and the task is sent without them typing anything.
3. **Given** a client with more than one property, **When** they raise a task, **Then**
   they choose which property it belongs to; **and given** a client with one property,
   **Then** no choice is offered and the task attaches to that property.
4. **Given** a client raising a task, **When** they send it, **Then** they are never asked
   to categorise, prioritise or organise it.
5. **Given** a client viewing their task list, **When** the list is shown, **Then** open
   tasks appear before completed ones.
6. **Given** a client viewing a task, **When** they add a note, **Then** the note appears
   in the task history attributed to them.
7. **Given** a task whose status the team has changed, **When** the client opens it,
   **Then** the current status is shown along with the history of what has happened.
8. **Given** a task the team marked done, **When** the team moves it back to in progress,
   **Then** the client sees it as in progress and both changes appear in its history.

---

### User Story 4 - Team works the task queue (Priority: P4)

A team member opens the admin area each morning and sees every task from every client in
one queue. They filter to the ones that are new, open a task, read it or play the voice
note, reply to the client, and move the status forward.

**Why this priority**: without this, tasks raised in Story 3 are received and never
answered. It is the service side of the client's request.

**Independent Test**: can be fully tested by signing in as a team member with tasks
present from at least two different clients, filtering by status, replying to a task, and
changing its status, then confirming the client sees both changes.

**Acceptance Scenarios**:

1. **Given** tasks raised by several clients, **When** a team member opens the task queue,
   **Then** every task across all clients is listed.
2. **Given** the task queue, **When** the team member filters by status, **Then** only
   tasks with that status are shown.
3. **Given** a task, **When** the team member changes its status to in progress, waiting
   on the client, done or cancelled, **Then** the new status is recorded and visible to
   the client.
4. **Given** a task, **When** the team member replies, **Then** the reply appears in the
   task history attributed to the team and is visible to the client who raised it.
5. **Given** a client attempting to reach the admin area, **When** they request any admin
   screen, **Then** they are refused.

---

### User Story 5 - Home screen tells the client whether anything needs attention (Priority: P5)

The client opens Dar and the first screen answers one question: does anything need me? If
a document is expiring, has expired, or a task has moved forward, those items are listed
with the most urgent first. If nothing is outstanding, the screen says so in a plain
sentence rather than showing an empty list.

**Why this priority**: it assembles what Stories 2, 3 and 4 produce, so it is built last,
but it is the screen the client sees first and the one that makes the product feel alive.

**Independent Test**: can be fully tested by seeding a client with a document expiring
inside the warning window, an expired document, and a task whose status has changed, then
confirming all three appear in the correct order; and separately by signing in as a client
with nothing outstanding and confirming the calm empty state.

**Acceptance Scenarios**:

1. **Given** a client with nothing due and no task awaiting them, **When** they open the
   home screen, **Then** it states plainly that nothing needs their attention.
2. **Given** a client with a document expiring inside the warning window, **When** they
   open the home screen, **Then** that document is listed as needing attention.
3. **Given** a client with several attention items, **When** the home screen is shown,
   **Then** items are ordered by urgency, soonest first.
4. **Given** a client whose task has moved to waiting on the client, **When** they open
   the home screen, **Then** that task appears as needing attention.
5. **Given** a client on the home screen, **When** they want to ask for something, **Then**
   a single primary action lets them raise a task without navigating first.

### Edge Cases

- An email address that is not registered requests a sign-in link. The system does not
  create an account and tells the person to contact the team.
- A sign-in link is expired, already used, or opened on a different device from the one
  that requested it.
- The sign-in link never arrives, because it went to spam or because the team recorded the
  client's address incorrectly. The client must be able to reach the team without an
  account.
- The same email address requests a sixth sign-in link within an hour, whether through
  impatience or an attempt to flood the inbox.
- A client has an account but no property yet, because setup is incomplete. The app says
  so plainly rather than showing a broken or blank home.
- A document has no expiry date, such as a floor plan. It is never marked as expiring or
  expired and never appears on the home screen.
- A document expires exactly today. It is treated as expired, not as expiring soon.
- A file is larger than the accepted limit, or is of a type the system does not accept.
  The upload is refused with a message saying what is allowed.
- An upload fails part way. The optimistic entry is removed and the client is told the
  upload did not complete.
- A client records a voice note but the device denies microphone permission, or the
  browser does not support recording. The text field remains available as the fallback.
- A client records a voice note of zero or near-zero length, or releases the button
  immediately by accident.
- A client submits a task with neither text nor a voice note. Submission is refused.
- A client loses connectivity mid-action. The interface shows what failed and lets them
  retry rather than sitting in a dead state.
- A client with many documents or many tasks. Lists stay usable and ordered.
- A client attempts to remove a stored file directly rather than through a screen, and is
  refused, so no document can be left pointing at a file that no longer exists.
- A client is deactivated while they are signed in, and their next action must stop
  working rather than silently succeeding.
- A deactivated client requests a sign-in link, and must receive the same response as any
  unregistered address.
- A client's property is reassigned while they are signed in.
- Two team members change the same task's status at the same time. The last change
  recorded wins, and both attempts appear in the history so neither is lost silently.
- A task marked done is reopened, and any attention item the client had already cleared
  returns to their home screen.
- A client attempts to reach another client's data by guessing an address.

## Requirements *(mandatory)*

### Functional Requirements

**Access and identity**

- **FR-001**: System MUST authenticate a person without a password, by issuing a
  single-use credential to a contact channel the team has already registered against that
  person. The credential MUST expire 15 minutes after it is issued and MUST work once only.
  A credential that is expired, already used, or superseded MUST be refused with an
  explanation and an offer to request another. **Method in this release**: a link sent by
  email, and no other. This requirement is deliberately worded so that a one-time code by
  email or by phone could satisfy it later without the requirement changing. Neither is
  built here and neither is in scope.
- **FR-002**: System MUST restrict sign-in to contact identifiers the team has already
  registered, an identifier being an email address in this release. An unregistered
  identifier MUST NOT create an account. The on-screen response MUST be identical whether
  or not the identifier is registered, so that the screen never reveals who holds an
  account; the instruction to contact the team MUST therefore be carried in the wording
  shown to everyone.

- **FR-045**: System MUST accept at most 5 sign-in credential requests per identifier per
  hour, and MUST refuse further requests within that hour with a message saying when the
  person may try again.

- **FR-046**: System MUST let a team member deactivate a client. From the moment of
  deactivation the client MUST NOT be able to sign in, and any session they already hold
  MUST cease to give access. A deactivated client's email address MUST be treated as
  unregistered by FR-002, including its identical on-screen response.

- **FR-055**: System MUST let a team member reverse a deactivation, restoring the client's
  access and clearing the recorded deactivation moment, so that a deactivation made in error
  is not permanent. Reversal MUST be available from the same screen as deactivation.

- **FR-047**: System MUST record the moment a client was deactivated, and MUST keep that
  client's properties, documents, tasks and files intact and reachable by the team during
  the retention period.

- **FR-048**: Retention policy: a deactivated client's files and records MUST be
  permanently deleted 90 days after deactivation. **Scope note for this release**: only
  FR-046 and FR-047 are built. The mechanism that acts on the 90 day clock is a named
  follow-up, deliberately excluded from this release, and MUST NOT be built here. No
  scheduled or recurring background job is in scope. Until that follow-up exists, deletion
  at 90 days is carried out by the team by hand.
- **FR-003**: System MUST distinguish two roles, client and team member, and MUST record
  which role each person holds.
- **FR-004**: System MUST prevent any client from reading or changing data belonging to
  another client, by any route.
- **FR-005**: System MUST prevent any client from reaching the admin area.
- **FR-006**: System MUST let a client view and update their own name and phone number,
  and sign out.

**Properties**

- **FR-007**: System MUST let a team member create a property against a client, recording
  a name, and optionally a community, an address and a photo.
- **FR-008**: System MUST support a client owning more than one property, and MUST show a
  list when there is more than one and go straight to the property when there is exactly
  one.
- **FR-009**: System MUST attach every document and every task to exactly one property.
- **FR-010**: System MUST show, for a property, its name, community, address, photo, its
  documents and its recent tasks.

**Documents**

- **FR-011**: System MUST let a client and a team member upload a document against a
  property, recording a title, a type and, optionally, an expiry date.
- **FR-012**: System MUST support the document types agreed for the service: AMC, Ejari,
  insurance, visa, Emirates ID, passport, vehicle, utility, warranty and other.
- **FR-013**: System MUST accept documents with no expiry date and MUST never mark them as
  expiring or expired.
- **FR-014**: System MUST mark a document as expiring soon when its expiry date falls
  within 30 days of today. The window is a fixed 30 days for every document type in this
  release. It MUST NOT vary by type, and MUST NOT be exposed as a setting to a client or
  to a team member.
- **FR-015**: System MUST mark a document as expired when its expiry date is today or
  earlier, and MUST mark it more prominently than expiring soon.
- **FR-016**: System MUST apply no status marking to a document that is neither expiring
  soon nor expired.
- **FR-017**: System MUST let a client open or download any document belonging to their
  property.
- **FR-018**: System MUST serve document files only through access that is granted on
  request and expires after a short period, and MUST NOT make any file publicly reachable.
- **FR-019**: System MUST let only a team member delete a document. A client MUST be able
  to upload a document but MUST NOT be able to delete one, including a document they
  uploaded themselves, and no client screen MUST offer the action. This MUST hold for the
  stored file as well as for the document record, so that a client cannot remove a file by
  any route and leave a document listed with nothing behind it.
- **FR-020**: System MUST refuse a file that exceeds the size limit or is of an unaccepted
  type, and MUST say what is allowed.

**Tasks**

- **FR-021**: System MUST let a client raise a task by writing text, by recording a voice
  note, or both.
- **FR-022**: System MUST refuse a task that has neither text nor a voice note.
- **FR-023**: System MUST give every task a title. Where a client supplies only a voice
  note, the system MUST generate a placeholder title that identifies the task by date, and
  the team MUST be able to rename it.
- **FR-024**: System MUST NOT require a client to categorise, prioritise, tag or organise
  a task in any way.
- **FR-025**: System MUST record a task's status as one of received, in progress, waiting
  on the client, done or cancelled, and MUST show the current status to the client.
- **FR-026**: System MUST set a new task's status to received.
- **FR-027**: System MUST allow only a team member to change a task's status.

- **FR-049**: System MUST allow a task to move from any status to any other status without
  restriction, including reopening a task that is done or cancelled. There is no permitted
  transition matrix.

- **FR-050**: System MUST record every status change in the task's history, showing the
  status it moved to, who changed it and when, and MUST show that history to the client.

- **FR-051**: System MUST, on the screen shown after a sign-in credential is requested,
  tell the person it has been sent, and offer to send another. Where the channel is email,
  the screen MUST also tell them to check their spam folder. The resend control MUST be
  unavailable for the first 60 seconds so that repeated taps do not consume the hourly
  allowance in FR-045.

- **FR-053**: System MUST meet WCAG 2.2 AA contrast throughout: at least 4.5:1 for body
  text, and at least 3:1 for large text, icons and the visible bounds of interactive
  controls, measured against the surface each sits on.

- **FR-054**: System MUST be fully operable by keyboard. Every action reachable by pointer
  MUST be reachable and operable by keyboard alone, in a logical order, with a visible
  focus indicator meeting FR-053, and no element that traps focus. This includes the bottom
  sheets used for create and detail flows.

- **FR-052**: System MUST offer, from the sign-in screens, a way to contact the team by
  WhatsApp that works without an account, because a person who cannot sign in has no other
  route to us. Email MUST NOT be the contact route offered, since WhatsApp is the channel
  clients already use. The destination MUST be read from the deployment environment as
  `NEXT_PUBLIC_SUPPORT_WHATSAPP`. It MUST NOT be hardcoded in the application, and MUST NOT
  be entered by the person. Where the variable is unset, the contact route MUST be hidden
  rather than rendered broken.
- **FR-028**: System MUST let a client and a team member add a note to a task, and MUST
  show the notes as a history attributed to their authors in the order they were added.
- **FR-029**: System MUST list a client's open tasks before their completed ones.
- **FR-030**: System MUST ask a client with more than one property which property a task
  belongs to, and MUST NOT ask a client with exactly one property.

**Home screen**

- **FR-031**: System MUST present, on the client's first screen, the items that need their
  attention, drawn from documents that are expiring or expired and tasks that have moved
  forward or are waiting on them.
- **FR-032**: System MUST order attention items by urgency, soonest first.
- **FR-033**: System MUST state plainly, in a sentence, that nothing needs attention when
  there are no attention items, rather than showing an empty list.
- **FR-034**: System MUST offer, from the home screen, a single primary action to raise a
  task.

**Admin area**

- **FR-035**: System MUST let a team member list all clients and open any one of them.
- **FR-036**: System MUST let a team member create a client from an email address and a
  name.
- **FR-037**: System MUST show a team member, for one client, their properties, documents
  and tasks.
- **FR-038**: System MUST let a team member upload documents on a client's behalf.
- **FR-039**: System MUST show a team member every task across all clients in one queue,
  filterable by status.
- **FR-040**: System MUST let a team member reply to a task and change its status.

**States and behaviour**

- **FR-041**: System MUST reflect a client's action in the interface immediately and
  reconcile with the recorded outcome afterwards, and MUST visibly revert an action that
  did not succeed.
- **FR-042**: System MUST show, while content is loading, a placeholder shaped like the
  content that is arriving, and MUST NOT show an indefinite loading indicator.
- **FR-043**: System MUST state, when something fails, what happened and what the person
  should do next.
- **FR-044**: System MUST place the primary action of every screen within the lower third
  of the viewport on a phone, so it is reachable by thumb on a one-handed grip. Tap targets
  MUST be at least 44px.

### Key Entities

- **Person**: someone who can sign in. Holds a name, a phone number, an email address and
  a role of either client or team member. Also holds the moment they were deactivated, if
  they have been; an active person has none. Every other record traces back to one.
- **Property**: a villa belonging to one client. Holds a name, and optionally a community,
  an address and a photo. A client may own several.
- **Document**: a file held for one property. Holds a title, a type, the file itself and,
  optionally, an expiry date and notes. Records who uploaded it. Its expiry, if present,
  determines whether it is quiet, expiring soon or expired.
- **Task**: a request raised against one property. Holds a title, optional text, an
  optional voice note, and a status that may move to any other status at any time. Records
  who raised it and when it last changed.
- **Task note**: one entry in a task's history. Holds text or a voice note, its author and
  when it was added.
- **Service record**: work carried out on a property, held for the home's history. Not
  shown on any screen in this release; recorded here because the data belongs to the
  product's Record pillar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: a signed-in client with a question about their home reaches the answer, such
  as a document's expiry date, in under 10 seconds from opening the app.
- **SC-002**: a client completes sign-in on a phone, from entering their email to landing
  on their home screen, in under 60 seconds including retrieving the link from email.
- **SC-003**: a client raises a task by voice note in under 15 seconds and three
  interactions or fewer, without typing.
- **SC-004**: a document uploaded with an expiry date appears on the client's home screen
  as an attention item once it falls inside the 30 day window, with no action by anyone.
- **SC-005**: a team member creates a new client, their property and a first document in
  under 5 minutes.
- **SC-006**: no client can reach another client's property, document or task, verified by
  signing in as two separate clients and attempting access in both directions.
- **SC-007**: no document file is reachable without a currently valid, time-limited grant,
  verified by attempting to reuse an expired link.
- **SC-012**: a sign-in credential stops working 15 minutes after it is issued and after a
  single use, and a sixth request from one identifier within an hour is refused, all three
  verified by direct attempt.
- **SC-013**: the sign-in screen gives the same response to a registered and an
  unregistered address, verified by submitting one of each and comparing what is shown.
- **SC-014**: a deactivated client cannot sign in and cannot use an existing session,
  verified by deactivating a client who is signed in and confirming their next action is
  refused; their records remain reachable by the team.
- **SC-015**: no document in the system points at a missing file, verified by attempting
  file removal as a client through every available route and confirming each is refused.
- **SC-016**: a client whose sign-in credential does not arrive can reach the team from the
  sign-in screen without an account, in one interaction.
- **SC-017**: every screen passes WCAG 2.2 AA contrast and can be completed end to end
  using only a keyboard, verified per screen against FR-053 and FR-054.
- **SC-008**: every screen presents exactly one primary action.
- **SC-009**: every list screen and every detail screen has a defined empty state, loading
  state and error state, and none of them is blank or indefinite.
- **SC-010**: the product is usable end to end on a phone in a browser, not only on a
  laptop.
- **SC-011**: within one month of a client being onboarded, at least half of the routine
  home questions they previously sent by message are answered in Dar instead, counted by
  the team as inbound questions that Dar already had the answer to.

## Assumptions

- **Sign-in is invite-only, and the screen does not disclose who is registered.** The team registers a client's email before that client can
  sign in. An unknown address is refused rather than being given an empty account. This
  follows from the brief's statement that a client's villa is already set up on first sign
  in.
- **The warning window is a fixed 30 days.** The brief says documents expiring soon must
  be marked but gives no threshold. Thirty days applies to every document type, is not
  configurable, and is not exposed in any interface. Should Ejari or visa later need a
  different window, that is a change to this specification, not a setting.
- **A voice-only task gets a generated title** identifying it by date, because every task
  needs a title and the client is never asked to supply one. The team renames it when they
  triage. No automatic transcription in this release.
- **Task status is the team's to change, never the client's.** The client can add a note
  but cannot mark their own task done. The team may move a task to any status at any time,
  including reopening a completed one, because a vendor's repair that fails a week later is
  the same request rather than a new one. The history is what keeps this honest.
- **Clients never delete documents or files.** Deletion is a team action only. The access
  rules as originally drafted permitted a client to delete both a document on their own
  property and the file behind it; both permissions have been withdrawn so the record of a
  home cannot be thinned by the client who most relies on it, and so no document can be
  left displaying an expiry with nothing behind it. This is a deliberate divergence from
  sections 3.2 and 3.3 of the build plan, recorded in both migration files.
- **Service records are recorded in the data model but have no screens** in this release.
- **English only.** No other language in this release. In user-facing copy the service is
  "the team"; "admin" is the database role and the route prefix, and MUST NOT appear in
  anything a client reads.
- **The scheduled deletion of a deactivated client's data is out of scope**, per FR-048.
  The 90 day retention policy is stated and the deactivation moment is recorded, so the
  clock is captured, but nothing acts on it automatically in this release. No cron job, no
  scheduled function, no recurring background task is to be built. Deletion at 90 days is a
  manual team action until the follow-up ships.
- **The WhatsApp contact destination is a configured value, not yet supplied.** FR-052
  requires a single WhatsApp destination, read from `NEXT_PUBLIC_SUPPORT_WHATSAPP`. The
  number has not been provided and MUST NOT be invented; it is supplied before launch. The
  variable is public by design: the sign-in screen needs it before any session exists, and
  a support number is not a secret.
- **The palette conflict with FR-053 is resolved, not deferred.** The design tokens as
  first drafted failed AA in four places. Resolved on 31 August 2026: the primary button
  keeps its gold fill with an `--ink` label at 4.85; its pressed state is expressed by
  scale rather than by darkening, and `--gold-deep` is deleted; `--gold-text` `#8F6631` is
  added for gold used as text or icons, at 4.62 on ivory; `--mute` becomes `#63706B` at
  4.68; and `--warn` moves to `#8F6631` for the same reason as `--gold-text`. Section 4.1
  of the build plan carries the measured ratios. No screen may use `--gold` for text.
- **Accessibility is WCAG 2.2 AA contrast and keyboard operability, and nothing further.**
  Screen reader labelling beyond what semantic markup gives for free, reduced-motion
  handling, and text resizing beyond browser default are out of scope for this release.
- **Authentication requirements are worded by method, not by channel.** Magic link by email
  is the only method built. FR-001, FR-002, FR-045 and FR-051 are phrased so that a one-time
  code by email or phone would satisfy them unchanged, should either be added later. Adding
  one is not in scope and no groundwork for it is to be built.
- **Notifications are out of scope.** Nothing is pushed, emailed or messaged to a client.
  Attention items are seen when the client opens the app. The only email sent is the
  sign-in link.
- **Payments, vendor access, quote comparison, group deals, photo reports, service history
  screens and native mobile apps are out of scope**, per the brief.
- **A client is assumed to have a working email address and mobile internet.**
- **Clients are few and each holds few properties**, so no search, pagination or bulk
  operation is specified. Lists are expected to stay short in this release.
