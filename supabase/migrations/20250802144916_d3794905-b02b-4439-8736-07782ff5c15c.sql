-- Fix security warning: Add search_path to function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create security definer function to check admin status to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Drop existing policies and recreate with security function
DROP POLICY IF EXISTS "Only admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Only admins can update users" ON public.users;
DROP POLICY IF EXISTS "Only admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Only admins can insert meal entries" ON public.meal_entries;
DROP POLICY IF EXISTS "Only admins can update meal entries" ON public.meal_entries;
DROP POLICY IF EXISTS "Only admins can delete meal entries" ON public.meal_entries;

-- Create new policies using security definer function
CREATE POLICY "Only admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (public.is_admin_user());

CREATE POLICY "Only admins can update users" 
ON public.users 
FOR UPDATE 
USING (public.is_admin_user());

CREATE POLICY "Only admins can delete users" 
ON public.users 
FOR DELETE 
USING (public.is_admin_user());

CREATE POLICY "Only admins can insert meal entries" 
ON public.meal_entries 
FOR INSERT 
WITH CHECK (public.is_admin_user());

CREATE POLICY "Only admins can update meal entries" 
ON public.meal_entries 
FOR UPDATE 
USING (public.is_admin_user());

CREATE POLICY "Only admins can delete meal entries" 
ON public.meal_entries 
FOR DELETE 
USING (public.is_admin_user());