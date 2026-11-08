-- Owner-only deletion; no file is deleted by applying this migration.
-- Safe to re-run. Existing read/upload policies stay unchanged.
do $$
begin
 if not exists (select 1 from pg_policies where schemaname='storage'
   and tablename='objects' and policyname='Delete own learning files') then
  create policy "Delete own learning files" on storage.objects
   for delete to authenticated
   using (bucket_id='learning-documents'
    and (storage.foldername(name))[1]=(select auth.uid()::text));
 end if;
end $$;
