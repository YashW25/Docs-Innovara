-- Drop the recursive policies that were causing the infinite loop
DROP POLICY IF EXISTS "Super Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super Admins can view all repositories" ON public.repositories;

-- Create a helper function to get the current user's role securely (bypassing RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role;
END;
$$;

-- Recreate policies using the secure helper function
CREATE POLICY "Super Admins can view all users" ON public.users FOR SELECT USING (
  public.get_user_role() = 'super_admin'
);

CREATE POLICY "Super Admins can view all repositories" ON public.repositories FOR SELECT USING (
  public.get_user_role() = 'super_admin'
);
