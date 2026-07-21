SET check_function_bodies = false;
DROP EXTENSION pg_net;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;
CREATE TYPE public.applicant_role AS ENUM ('student', 'staff', 'school-network', 'general');
CREATE FUNCTION public.enforce_max_2_topics()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  topic_count int;
begin
  select count(*)
  into topic_count
  from public.registration_topics
  where registration_id = new.registration_id;

  if topic_count >= 2 then
    raise exception 'Each registration can select at most 2 topics';
  end if;

  return new;
end;
$function$;
GRANT ALL ON FUNCTION public.enforce_max_2_topics() TO anon;
GRANT ALL ON FUNCTION public.enforce_max_2_topics() TO authenticated;
GRANT ALL ON FUNCTION public.enforce_max_2_topics() TO service_role;
CREATE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;
CREATE TABLE public.registration_topics (registration_id uuid NOT NULL, workshop_id uuid NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.registration_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_topics ADD CONSTRAINT registration_topics_pkey PRIMARY KEY (registration_id, workshop_id);
GRANT ALL ON public.registration_topics TO anon;
GRANT ALL ON public.registration_topics TO authenticated;
GRANT ALL ON public.registration_topics TO service_role;
CREATE TRIGGER trg_enforce_max_2_topics BEFORE INSERT ON public.registration_topics FOR EACH ROW EXECUTE FUNCTION public.enforce_max_2_topics();
CREATE POLICY registration_topics_insert_public ON public.registration_topics FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY registration_topics_select_public ON public.registration_topics FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.registrations (id uuid DEFAULT gen_random_uuid() NOT NULL, full_name text NOT NULL, email text NOT NULL, phone character varying(25) NOT NULL, organization text NOT NULL, role public.applicant_role NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ADD CONSTRAINT registrations_email_format_chk CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'::text) NOT VALID;
ALTER TABLE public.registrations ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);
ALTER TABLE public.registration_topics ADD CONSTRAINT registration_topics_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON DELETE CASCADE;
GRANT ALL ON public.registrations TO anon;
GRANT ALL ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
CREATE INDEX registrations_email_idx ON public.registrations (lower(email));
CREATE TRIGGER trg_registrations_set_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY registrations_insert_public ON public.registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY registrations_select_public ON public.registrations FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.workshops (id uuid DEFAULT gen_random_uuid() NOT NULL, code text NOT NULL, title text NOT NULL, topic_name text NOT NULL, event_date date NOT NULL, is_active boolean DEFAULT true NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ADD CONSTRAINT workshops_code_key UNIQUE (code);
ALTER TABLE public.workshops ADD CONSTRAINT workshops_pkey PRIMARY KEY (id);
ALTER TABLE public.registration_topics ADD CONSTRAINT registration_topics_workshop_id_fkey FOREIGN KEY (workshop_id) REFERENCES public.workshops(id) ON DELETE RESTRICT;
GRANT ALL ON public.workshops TO anon;
GRANT ALL ON public.workshops TO authenticated;
GRANT ALL ON public.workshops TO service_role;
CREATE POLICY workshops_select_active ON public.workshops FOR SELECT TO anon, authenticated USING ((is_active = true));
