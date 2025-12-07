-- Drop overly permissive public SELECT policies on entegrator table
DROP POLICY IF EXISTS "Anyone can view entegrator profiles" ON public.entegrator;
DROP POLICY IF EXISTS "Entegratorler herkese açık okunabilir" ON public.entegrator;

-- Create new policy that requires authentication to view entegrator profiles
CREATE POLICY "Authenticated users can view entegrator profiles"
ON public.entegrator
FOR SELECT
TO authenticated
USING (true);

-- Allow entegrators to always see their own profile (even for edge cases)
CREATE POLICY "Entegrators can view their own profile"
ON public.entegrator
FOR SELECT
USING (auth.uid() = user_id);