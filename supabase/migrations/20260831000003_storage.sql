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
