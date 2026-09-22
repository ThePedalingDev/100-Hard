-- Owner approval required before apply.
-- Allows members to delete their own progress plates and storage files.

create policy photos_delete on public.progress_photos
  for delete to authenticated
  using (user_id = auth.uid());

create policy progress_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'progress'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
