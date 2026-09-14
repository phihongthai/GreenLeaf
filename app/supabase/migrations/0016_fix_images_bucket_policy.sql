-- 0015 added an INSERT policy on the greenleaf-images bucket with no role/auth restriction —
-- WITH CHECK (bucket_id = 'greenleaf-images') applies to PUBLIC by default (no `TO` clause),
-- meaning anyone holding the public anon key could upload arbitrary files directly via
-- Supabase's Storage REST API, bypassing the app entirely. The only writer that should ever
-- touch this bucket is server-side code using the service role key (scripts/populate-images.ts,
-- previously also app/api/image/route.ts which has been removed since it was an unauthenticated,
-- unused, publicly-reachable endpoint) — and the service role bypasses RLS anyway, so this
-- policy was pure unnecessary exposure. Drop it; public READ stays (needed to display images).
DROP POLICY IF EXISTS "greenleaf_images_service_write" ON storage.objects;
