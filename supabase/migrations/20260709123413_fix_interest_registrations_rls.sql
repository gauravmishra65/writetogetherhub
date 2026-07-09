-- Fix: Tighten the always-true INSERT policy on interest_registrations
-- Replace WITH CHECK (true) with meaningful field validation.

DROP POLICY IF EXISTS "Anyone can register interest" ON public.interest_registrations;

CREATE POLICY "Anyone can register interest" ON public.interest_registrations
FOR INSERT TO anon, authenticated
WITH CHECK (
  parent_name       IS NOT NULL AND length(trim(parent_name))       > 0
  AND phone         IS NOT NULL AND length(trim(phone))             > 0
  AND grade         IS NOT NULL AND length(trim(grade))             > 0
  AND tuition_mode      IS NOT NULL AND length(trim(tuition_mode))      > 0
  AND timing_preference IS NOT NULL AND length(trim(timing_preference)) > 0
  AND interest_type     IS NOT NULL AND length(trim(interest_type))     > 0
);
