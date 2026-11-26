-- =========================================================================
-- WanderPlan Supabase Schema & Public Share Policies
-- =========================================================================

-- 1. Ensure is_public column exists on trips table (default false)
ALTER TABLE IF EXISTS public.trips 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 2. Enable Row Level Security (RLS) on trips table
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public can view trips if is_public = true OR owned by user
DROP POLICY IF EXISTS "Public can view shared trips" ON public.trips;
CREATE POLICY "Public can view shared trips" 
ON public.trips 
FOR SELECT 
USING (
  is_public = true 
  OR auth.uid() = user_id
);

-- 4. Policy: Users can insert their own trips
DROP POLICY IF EXISTS "Users can insert their own trips" ON public.trips;
CREATE POLICY "Users can insert their own trips" 
ON public.trips 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
);

-- 5. Policy: Users can update their own trips (including toggling is_public)
DROP POLICY IF EXISTS "Users can update their own trips" ON public.trips;
CREATE POLICY "Users can update their own trips" 
ON public.trips 
FOR UPDATE 
USING (
  auth.uid() = user_id
);

-- 6. Policy: Users can delete their own trips
DROP POLICY IF EXISTS "Users can delete their own trips" ON public.trips;
CREATE POLICY "Users can delete their own trips" 
ON public.trips 
FOR DELETE 
USING (
  auth.uid() = user_id
);
