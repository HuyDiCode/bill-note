-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES 
  ('avatars', 'avatars', true, false),
  ('receipts', 'receipts', false, false),
  ('group_avatars', 'group_avatars', true, false)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for avatars bucket (public)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() = owner AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() = owner AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() = owner AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Set up security policies for receipts bucket (private)
CREATE POLICY "Users can view receipts from their groups"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM expenses e
      JOIN group_members gm ON e.group_id = gm.group_id
      WHERE e.receipt_image_url LIKE '%' || storage.filename(name) || '%'
      AND gm.user_id = auth.uid()
      AND gm.is_active = TRUE
    )
  );

CREATE POLICY "Users can upload receipts for their expenses"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can update their own receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipts' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete their own receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts' AND
    auth.uid() = owner
  );

-- Set up security policies for group_avatars bucket (public)
CREATE POLICY "Group avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'group_avatars');

CREATE POLICY "Group admins can upload group avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'group_avatars' AND
    auth.uid() = owner AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
      AND role = 'admin'
      AND is_active = TRUE
    )
  );

CREATE POLICY "Group admins can update group avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'group_avatars' AND
    auth.uid() = owner AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
      AND role = 'admin'
      AND is_active = TRUE
    )
  );

CREATE POLICY "Group admins can delete group avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'group_avatars' AND
    auth.uid() = owner AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
      AND role = 'admin'
      AND is_active = TRUE
    )
  );

-- Create helper functions for file management
CREATE OR REPLACE FUNCTION public.get_avatar_upload_path(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN user_id::text || '/' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_receipt_upload_path(expense_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN expense_id::text || '/' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_group_avatar_upload_path(group_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN group_id::text || '/' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql; 