
-- Restrict SELECT: only authenticated admins/managers can read directly
-- Anonymous guests will use the edge function instead
DROP POLICY IF EXISTS "Anyone can view bookings by email" ON public.bookings;

CREATE POLICY "Guests can view own bookings by email"
  ON public.bookings FOR SELECT
  TO public
  USING (false);
