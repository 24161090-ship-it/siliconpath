-- Additive: keeps workspaces, existing submissions and the runner untouched.
-- File objects remain private. Metadata is part of the existing workspace JSON.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('learning-documents','learning-documents',false,10000000,array['application/pdf','image/png','image/jpeg','text/plain'])
on conflict (id) do nothing;
create policy "Read own learning files" on storage.objects for select to authenticated
using (bucket_id='learning-documents' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy "Upload own learning files" on storage.objects for insert to authenticated
with check (bucket_id='learning-documents' and (storage.foldername(name))[1]=(select auth.uid()::text));
-- No public-read policy and no cross-account storage grants are introduced.
