-- Create auth accounts for the two designated admins and register them in the admins table.
-- Passwords are intentionally left empty; each admin must set their password via
-- the Supabase dashboard "Send password reset" flow or the forgot-password screen.

DO $$
DECLARE
  v_gaurav uuid;
  v_hello  uuid;
BEGIN
  -- ── gaurav.mishra65@gmail.com ──────────────────────────────────────────────
  SELECT id INTO v_gaurav FROM auth.users WHERE email = 'gaurav.mishra65@gmail.com';

  IF v_gaurav IS NULL THEN
    v_gaurav := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password,
      email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      is_super_admin, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_gaurav,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'gaurav.mishra65@gmail.com', '',
      now(),
      '{"provider":"email","providers":["email"]}', '{}',
      now(), now(),
      false, '', '', '', ''
    );
  END IF;

  INSERT INTO public.admins (user_id) VALUES (v_gaurav) ON CONFLICT DO NOTHING;

  -- ── hello@writetogetherhub.com ────────────────────────────────────────────
  SELECT id INTO v_hello FROM auth.users WHERE email = 'hello@writetogetherhub.com';

  IF v_hello IS NULL THEN
    v_hello := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password,
      email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      is_super_admin, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_hello,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'hello@writetogetherhub.com', '',
      now(),
      '{"provider":"email","providers":["email"]}', '{}',
      now(), now(),
      false, '', '', '', ''
    );
  END IF;

  INSERT INTO public.admins (user_id) VALUES (v_hello) ON CONFLICT DO NOTHING;
END;
$$;
