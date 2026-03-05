-- Fix the overly permissive booking insert policy
DROP POLICY "Guests can create bookings" ON public.bookings;
CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);