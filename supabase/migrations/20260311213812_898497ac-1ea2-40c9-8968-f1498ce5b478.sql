
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  country      TEXT NOT NULL,
  subject      TEXT NOT NULL,
  message      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  is_starred   BOOLEAN NOT NULL DEFAULT FALSE,
  replied_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages"
  ON public.contact_messages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
