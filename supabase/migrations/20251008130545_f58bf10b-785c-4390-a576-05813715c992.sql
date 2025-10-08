-- Enable RLS on verification_codes (ensure enabled)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon and authenticated) to insert verification codes
CREATE POLICY "Anyone can insert verification codes"
ON public.verification_codes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to view verification codes (used only for short-lived verification)
CREATE POLICY "Anyone can view verification codes"
ON public.verification_codes
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to delete verification codes (cleanup by client before/after use)
CREATE POLICY "Anyone can delete verification codes"
ON public.verification_codes
FOR DELETE
TO anon, authenticated
USING (true);
