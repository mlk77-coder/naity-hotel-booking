
-- Allow partner users to read bookings for hotels linked to their partner
CREATE OR REPLACE FUNCTION public.get_partner_hotel_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.id
  FROM public.hotels h
  JOIN public.partner_users pu ON pu.partner_id = h.tech_partner_id
  WHERE pu.user_id = _user_id
$$;

CREATE POLICY "Partner users can view bookings for their hotels"
ON public.bookings
FOR SELECT
TO authenticated
USING (hotel_id IN (SELECT get_partner_hotel_ids(auth.uid())));
