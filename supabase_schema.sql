-- Supabase SQL Schema for Personalized Travel Itinerary Planner
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget TEXT NOT NULL,
    interests TEXT[] DEFAULT '{}',
    travel_style TEXT NOT NULL,
    itinerary_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    share_token UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow users to view their own trips OR public trips
CREATE POLICY "Users can view own trips or public trips"
    ON public.trips
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR is_public = true
    );

-- Allow authenticated users to insert their own trips
CREATE POLICY "Users can insert own trips"
    ON public.trips
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own trips
CREATE POLICY "Users can update own trips"
    ON public.trips
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete only their own trips
CREATE POLICY "Users can delete own trips"
    ON public.trips
    FOR DELETE
    USING (auth.uid() = user_id);

-- Indexing for fast queries
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_share_token ON public.trips(share_token);
