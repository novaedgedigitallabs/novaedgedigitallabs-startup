-- Community Features Schema

-- Create Likes Table
CREATE TABLE public.likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_slug text NOT NULL REFERENCES public.startups(slug) ON DELETE CASCADE,
  user_id text NOT NULL, -- GitHub username
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(startup_slug, user_id)
);

-- Create Bookmarks Table
CREATE TABLE public.bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_slug text NOT NULL REFERENCES public.startups(slug) ON DELETE CASCADE,
  user_id text NOT NULL, -- GitHub username
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(startup_slug, user_id)
);

-- Create Comments Table
CREATE TABLE public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_slug text NOT NULL REFERENCES public.startups(slug) ON DELETE CASCADE,
  user_id text NOT NULL, -- GitHub username
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_likes_startup ON public.likes(startup_slug);
CREATE INDEX idx_bookmarks_startup ON public.bookmarks(startup_slug);
CREATE INDEX idx_comments_startup ON public.comments(startup_slug);
CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);

-- Optional: Enable RLS and add policies if Row Level Security is active
-- ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
