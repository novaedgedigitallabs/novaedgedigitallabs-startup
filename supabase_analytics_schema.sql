-- Analytics Schema

-- 1. Add views column to startups table
ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;

-- 2. Create an RPC (Remote Procedure Call) to safely increment views atomically
CREATE OR REPLACE FUNCTION increment_startup_views(startup_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.startups
  SET views = COALESCE(views, 0) + 1
  WHERE slug = startup_slug;
END;
$$ LANGUAGE plpgsql;
