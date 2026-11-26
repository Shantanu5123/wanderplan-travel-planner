-- =========================================================================
-- WanderPlan: saved_destinations & user_preferences Tables and Policies
-- =========================================================================

-- 1. Table: saved_destinations
CREATE TABLE IF NOT EXISTS public.saved_destinations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  destination_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, slug)
);

-- Enable RLS for saved_destinations
ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved destinations" ON public.saved_destinations;
CREATE POLICY "Users can view their own saved destinations"
ON public.saved_destinations
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved destinations" ON public.saved_destinations;
CREATE POLICY "Users can insert their own saved destinations"
ON public.saved_destinations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved destinations" ON public.saved_destinations;
CREATE POLICY "Users can delete their own saved destinations"
ON public.saved_destinations
FOR DELETE
USING (auth.uid() = user_id);


-- 2. Table: user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency TEXT DEFAULT 'USD',
  default_pace TEXT DEFAULT 'balanced',
  default_budget TEXT DEFAULT 'moderate',
  dietary_notes TEXT DEFAULT '',
  mobility_notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert/update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert/update their own preferences"
ON public.user_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
