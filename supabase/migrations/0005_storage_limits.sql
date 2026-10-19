-- Server-side limits for the media bucket. The client converts images to WebP,
-- keeps GIFs as they are and uploads PDFs, so only those three types are allowed.
update storage.buckets
set file_size_limit = 10485760, -- 10 MB
    allowed_mime_types = array['image/webp', 'image/gif', 'application/pdf']
where id = 'media';
