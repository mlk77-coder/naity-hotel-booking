CREATE POLICY "Partner can view own tech_partner record"
  ON public.tech_partners
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT partner_id FROM public.partner_users
      WHERE user_id = auth.uid()
    )
  );