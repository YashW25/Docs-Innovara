-- 1. Create Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'manager', 'user')),
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Users Table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Create Repositories Table
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Repositories Table
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

-- 3. Create Documents Table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  size_bytes INTEGER,
  last_commit_sha TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Documents Table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 4. Create Activity Logs Table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Activity Logs Table
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies

-- Users Table Policies
-- Super Admin can see all users
CREATE POLICY "Super Admins can view all users" ON public.users FOR SELECT USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);
-- Managers can see users they created
CREATE POLICY "Managers can view assigned users" ON public.users FOR SELECT USING (
  manager_id = auth.uid() OR id = auth.uid()
);
-- Users can see their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (
  id = auth.uid()
);

-- Repositories Table Policies
-- Super Admins can see all repos
CREATE POLICY "Super Admins can view all repositories" ON public.repositories FOR SELECT USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);
-- Managers can see repos of their assigned users
CREATE POLICY "Managers can view assigned user repositories" ON public.repositories FOR SELECT USING (
  user_id IN (SELECT id FROM public.users WHERE manager_id = auth.uid())
);
-- Users can see their own repos
CREATE POLICY "Users can view own repositories" ON public.repositories FOR SELECT USING (
  user_id = auth.uid()
);

-- Note: INSERT, UPDATE, DELETE operations will primarily be handled by Next.js Server Actions using the Service Role Key for security, thus bypassing RLS for writing. This ensures users cannot bypass application logic directly via the database.
