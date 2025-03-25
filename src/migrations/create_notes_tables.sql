-- Tạo bảng notes (ghi chú chi tiêu)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  store_name TEXT,
  store_address TEXT,
  total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng note_items (các mục chi tiêu trong ghi chú)
CREATE TABLE IF NOT EXISTS note_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng note_collaborators (người dùng được chia sẻ ghi chú)
CREATE TABLE IF NOT EXISTS note_collaborators (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (note_id, user_id)
);

-- Tạo bảng receipt_images (lưu trữ hình ảnh hóa đơn)
CREATE TABLE IF NOT EXISTS receipt_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng profiles (hồ sơ người dùng)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  default_currency TEXT DEFAULT 'VND',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger để tự động cập nhật thời gian chỉnh sửa
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho bảng notes
DROP TRIGGER IF EXISTS update_notes_modtime ON notes;
CREATE TRIGGER update_notes_modtime
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Áp dụng trigger cho bảng note_items
DROP TRIGGER IF EXISTS update_note_items_modtime ON note_items;
CREATE TRIGGER update_note_items_modtime
BEFORE UPDATE ON note_items
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Áp dụng trigger cho bảng profiles
DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Trigger để tính toán tổng số tiền cho một note khi thêm/sửa/xóa note_items
CREATE OR REPLACE FUNCTION calculate_note_total()
RETURNS TRIGGER AS $$
DECLARE 
  new_total NUMERIC(15, 2);
BEGIN
  -- Tính tổng số tiền từ tất cả các mục trong note
  SELECT COALESCE(SUM(total_price), 0) INTO new_total
  FROM note_items
  WHERE note_id = COALESCE(NEW.note_id, OLD.note_id);
  
  -- Cập nhật tổng số tiền trong notes
  UPDATE notes
  SET total_amount = new_total
  WHERE id = COALESCE(NEW.note_id, OLD.note_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho việc thêm/sửa/xóa note_items
DROP TRIGGER IF EXISTS calculate_note_total_insert ON note_items;
CREATE TRIGGER calculate_note_total_insert
AFTER INSERT ON note_items
FOR EACH ROW
EXECUTE FUNCTION calculate_note_total();

DROP TRIGGER IF EXISTS calculate_note_total_update ON note_items;
CREATE TRIGGER calculate_note_total_update
AFTER UPDATE OF quantity, unit_price, total_price ON note_items
FOR EACH ROW
EXECUTE FUNCTION calculate_note_total();

DROP TRIGGER IF EXISTS calculate_note_total_delete ON note_items;
CREATE TRIGGER calculate_note_total_delete
AFTER DELETE ON note_items
FOR EACH ROW
EXECUTE FUNCTION calculate_note_total();

-- Tạo RLS policy cho bảng notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy cho phép người dùng chỉ xem và chỉnh sửa các ghi chú của mình
CREATE POLICY notes_owner_policy ON notes
    USING (added_by = auth.uid())
    WITH CHECK (added_by = auth.uid());

-- Policy cho phép người dùng xem các ghi chú được chia sẻ với họ
CREATE POLICY notes_collaborator_view_policy ON notes
    USING (id IN (
        SELECT note_id FROM note_collaborators 
        WHERE user_id = auth.uid()
    ));

-- Tạo RLS policy cho bảng note_items
ALTER TABLE note_items ENABLE ROW LEVEL SECURITY;

-- Policy cho phép người dùng xem và chỉnh sửa các mục trong ghi chú của họ
CREATE POLICY note_items_owner_policy ON note_items
    USING (note_id IN (
        SELECT id FROM notes WHERE added_by = auth.uid()
    ))
    WITH CHECK (note_id IN (
        SELECT id FROM notes WHERE added_by = auth.uid()
    ));

-- Policy cho phép người dùng xem các mục trong ghi chú được chia sẻ với họ
CREATE POLICY note_items_collaborator_view_policy ON note_items
    USING (note_id IN (
        SELECT note_id FROM note_collaborators 
        WHERE user_id = auth.uid()
    ));

-- Tạo RLS policy cho bảng note_collaborators
ALTER TABLE note_collaborators ENABLE ROW LEVEL SECURITY;

-- Policy cho phép người dùng xem người được chia sẻ ghi chú của họ
CREATE POLICY note_collaborators_owner_policy ON note_collaborators
    USING (note_id IN (
        SELECT id FROM notes WHERE added_by = auth.uid()
    ))
    WITH CHECK (note_id IN (
        SELECT id FROM notes WHERE added_by = auth.uid()
    ));

-- Tạo RLS policy cho bảng receipt_images
ALTER TABLE receipt_images ENABLE ROW LEVEL SECURITY;

-- Policy cho phép người dùng xem và quản lý hình ảnh hóa đơn của họ
CREATE POLICY receipt_images_owner_policy ON receipt_images
    USING (uploaded_by = auth.uid() OR note_id IN (
        SELECT id FROM notes WHERE added_by = auth.uid()
    ))
    WITH CHECK (uploaded_by = auth.uid());

-- Policy cho phép người dùng xem hình ảnh hóa đơn trong ghi chú được chia sẻ
CREATE POLICY receipt_images_collaborator_view_policy ON receipt_images
    USING (note_id IN (
        SELECT note_id FROM note_collaborators 
        WHERE user_id = auth.uid()
    ));

-- Tạo RLS policy cho bảng profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy cho phép người dùng xem và chỉnh sửa hồ sơ của mình
CREATE POLICY profiles_owner_policy ON profiles
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Policy cho phép người dùng xem hồ sơ của người khác
CREATE POLICY profiles_view_policy ON profiles
    USING (true)
    WITH CHECK (id = auth.uid());

-- Tạo trigger để tự động tạo profile cho người dùng mới
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho bảng người dùng
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user(); 