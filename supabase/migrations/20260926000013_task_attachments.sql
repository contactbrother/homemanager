-- Phase C: photos and videos on requests. An attachment belongs to a request, and to
-- the message it was sent with (null when added with the request itself). Visible to
-- exactly the people who can see the request's messages.
create table task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  message_id uuid references task_messages(id) on delete cascade,
  uploaded_by uuid not null references profiles(id),
  file_path text not null,
  mime_type text not null,
  file_size bigint,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index task_attachments_task_idx on task_attachments(task_id);
create index task_attachments_message_idx on task_attachments(message_id);

alter table task_attachments enable row level security;

create policy "read attachments on own tasks" on task_attachments
  for select using (
    is_admin() or (is_active() and task_id in (
      select t.id from tasks t join properties p on p.id = t.property_id
      where p.owner_id = auth.uid()
    ))
  );

create policy "add attachments on own tasks" on task_attachments
  for insert with check (
    uploaded_by = auth.uid() and (
      is_admin() or (is_active() and task_id in (
        select t.id from tasks t join properties p on p.id = t.property_id
        where p.owner_id = auth.uid()
      ))
    )
  );

create policy "team deletes attachments" on task_attachments
  for delete using (is_admin());

-- Photos (including iPhone HEIC) and phone videos, up to 50 MB per file.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'application/pdf',
      'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'image/gif',
      'video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp',
      'audio/webm', 'audio/mpeg', 'audio/mp4', 'audio/ogg'
    ]
where id = 'dar-files';

-- New attachments refresh an open conversation too.
alter publication supabase_realtime add table task_attachments;
