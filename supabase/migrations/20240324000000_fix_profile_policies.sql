-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create corrected policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = profiles.id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = profiles.id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = profiles.id);

-- Create a function to handle profile updates with avatar
CREATE OR REPLACE FUNCTION public.update_profile_with_avatar(
  user_id UUID,
  user_name TEXT,
  avatar_url TEXT
)
RETURNS SETOF profiles AS $$
BEGIN
  UPDATE profiles
  SET 
    name = user_name,
    avatar_url = avatar_url,
    updated_at = now()
  WHERE id = user_id;
  
  RETURN QUERY SELECT * FROM profiles WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get signed URL for avatar upload
CREATE OR REPLACE FUNCTION public.get_avatar_upload_url(
  file_name TEXT,
  file_type TEXT
)
RETURNS TEXT AS $$
DECLARE
  path TEXT;
  url TEXT;
BEGIN
  -- Generate path for the file
  path := auth.uid()::text || '/' || gen_random_uuid()::text || '.' || split_part(file_type, '/', 2);
  
  -- Generate signed URL
  SELECT storage.create_signed_upload_url(
    'avatars',
    path,
    file_type,
    60 -- URL expires in 60 seconds
  ) INTO url;
  
  RETURN json_build_object(
    'path', path,
    'url', url
  )::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 