-- Drop existing authenticated-only SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view entegrator profiles" ON public.entegrator;

-- Create a public read policy for viewing entegrator profiles (basic info only)
-- Contact info is protected via the reveal-contact edge function and credit system
CREATE POLICY "Anyone can view entegrator profiles for browsing"
ON public.entegrator
FOR SELECT
USING (true);

-- Keep the owner policy for full access
DROP POLICY IF EXISTS "Entegrators can view their own profile" ON public.entegrator;
CREATE POLICY "Entegrators can manage their own profile"
ON public.entegrator
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);