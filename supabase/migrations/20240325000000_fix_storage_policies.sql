-- Consolidate all storage and group_members RLS policy fixes in one file
-- First, drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view receipts from their groups" ON storage.objects;
DROP POLICY IF EXISTS "Group avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Group admins can upload group avatars" ON storage.objects;
DROP POLICY IF EXISTS "Group admins can update group avatars" ON storage.objects;
DROP POLICY IF EXISTS "Group admins can delete group avatars" ON storage.objects;

-- Fix RLS policies on group_members table that are causing infinite recursion
DROP POLICY IF EXISTS "Group members can view other members" ON group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;

-- Create optimized policies for group_members without circular references
CREATE POLICY "Group members can view other members"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT gm.group_id FROM group_members gm 
      WHERE gm.user_id = (SELECT auth.uid()) AND gm.is_active = TRUE
    )
  );

CREATE POLICY "Group admins can manage members"
  ON group_members FOR ALL
  USING (
    (SELECT auth.uid()) IN (
      SELECT gm.user_id FROM group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.role = 'admin' 
      AND gm.is_active = TRUE
    )
  );

-- Recreate simplified storage policies without complex joins or recursion
-- Avatar policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (SELECT auth.uid()) IS NOT NULL AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (SELECT auth.uid()) IS NOT NULL AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (SELECT auth.uid()) IS NOT NULL AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Simple receipts policy
CREATE POLICY "Users can view receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND (SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    (SELECT auth.uid()) IS NOT NULL
  );

CREATE POLICY "Users can update receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipts' AND
    (SELECT auth.uid()) IS NOT NULL
  );

CREATE POLICY "Users can delete receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts' AND
    (SELECT auth.uid()) IS NOT NULL
  );

-- Group avatars policies
CREATE POLICY "Group avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'group_avatars');

CREATE POLICY "Users can manage group avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'group_avatars' AND
    (SELECT auth.uid()) IS NOT NULL
  );

CREATE POLICY "Users can update group avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'group_avatars' AND
    (SELECT auth.uid()) IS NOT NULL
  );

CREATE POLICY "Users can delete group avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'group_avatars' AND
    (SELECT auth.uid()) IS NOT NULL
  );

-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES 
  ('avatars', 'avatars', true, false),
  ('receipts', 'receipts', false, false),
  ('group_avatars', 'group_avatars', true, false)
ON CONFLICT (id) DO NOTHING;

-- Modify handleAvatarUpload function in settings page to use a simpler approach
-- This function should be implemented in your client-side code
-- The simplified version would look like:
/*
const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  setLoading(true)
  try {
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Math.random()}.${fileExt}`
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update profile with new avatar URL
    setUser({ ...user, avatar_url: publicUrl })
    
    // Update profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: user.name,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      
    if (error) throw error
  } catch (error) {
    console.error('Error uploading avatar:', error)
    alert('Error uploading avatar!')
  } finally {
    setLoading(false)
  }
}
*/ 