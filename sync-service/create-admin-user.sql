-- ============================================================================
-- Create Admin User for Supabase Project: scmgtoqilbkakxikigtz
-- ============================================================================
-- Email: admin@test.com
-- Password: 00000000
-- 
-- INSTRUCTIONS:
-- 1. Go to https://supabase.com/dashboard/project/scmgtoqilbkakxikigtz/sql
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- 4. You can then login at your website with admin@test.com / 00000000
-- ============================================================================

DO $$
DECLARE
  new_user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- Generate encrypted password for '00000000'
  -- Supabase uses bcrypt with cost factor 10
  encrypted_pw := crypt('00000000', gen_salt('bf'));
  
  -- Insert user into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@test.com',
    encrypted_pw,
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
  )
  RETURNING id INTO new_user_id;

  -- Insert profile (will be auto-created by trigger, but we ensure it exists)
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new_user_id, 'admin@test.com', 'Admin User')
  ON CONFLICT (user_id) DO NOTHING;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin');

  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: admin@test.com';
  RAISE NOTICE 'Password: 00000000';
  RAISE NOTICE 'User ID: %', new_user_id;
  
END $$;

-- ============================================================================
-- Verify the admin user was created
-- ============================================================================
SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'admin@test.com';
