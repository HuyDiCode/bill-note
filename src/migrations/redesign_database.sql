-- REDESIGN DATABASE STRUCTURE
-- Đầu tiên xóa các policies hiện có nếu có
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes_new;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes_new;
DROP POLICY IF EXISTS "Users can update their own notes or notes they collaborate on" ON public.notes_new;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes_new;

DROP POLICY IF EXISTS "Users can view items of their notes" ON public.note_items_new;
DROP POLICY IF EXISTS "Users can insert items to their notes or notes they collaborate on" ON public.note_items_new;
DROP POLICY IF EXISTS "Users can update items of their notes or notes they collaborate on" ON public.note_items_new;
DROP POLICY IF EXISTS "Users can delete items of their notes or notes they collaborate on" ON public.note_items_new;

DROP POLICY IF EXISTS "Users can see collaborators of their notes" ON public.note_collaborators;
DROP POLICY IF EXISTS "Note owners can manage collaborators" ON public.note_collaborators;

DROP POLICY IF EXISTS "Users can see note tags" ON public.note_tags;
DROP POLICY IF EXISTS "Users can manage tags for their notes" ON public.note_tags;

-- Xóa các bảng cũ với CASCADE để xóa tất cả dependencies
DROP TABLE IF EXISTS public.note_tags CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.note_collaborators CASCADE;
DROP TABLE IF EXISTS public.note_items CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;

-- Xóa các bảng "_new" nếu còn tồn tại từ lần chạy trước
DROP TABLE IF EXISTS public.note_items_new CASCADE;
DROP TABLE IF EXISTS public.notes_new CASCADE;
DROP TABLE IF EXISTS public.profiles_new CASCADE;

-- Xóa các tables cũ nếu tồn tại
DROP TABLE IF EXISTS public.expense_items CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;

-- Xóa các types nếu đã tồn tại
DROP TYPE IF EXISTS public.note_category CASCADE;
DROP TYPE IF EXISTS public.currency_code CASCADE;

-- Tạo enum types để giới hạn các giá trị cho danh mục và đơn vị tiền tệ
CREATE TYPE public.note_category AS ENUM (
  'Thực phẩm', 
  'Nhà cửa', 
  'Di chuyển', 
  'Quần áo', 
  'Giải trí', 
  'Học tập', 
  'Y tế', 
  'Khác'
);

CREATE TYPE public.currency_code AS ENUM (
  'VND', 
  'USD', 
  'EUR'
);

-- Tạo bảng categories để quản lý các danh mục
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tạo bảng stores để quản lý các cửa hàng
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cải tiến bảng profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  default_currency currency_code DEFAULT 'VND'::currency_code,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cải tiến bảng notes
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date DEFAULT CURRENT_DATE,
  total_amount numeric DEFAULT 0,
  currency currency_code DEFAULT 'VND'::currency_code,
  store_id uuid REFERENCES public.stores(id),
  category_id uuid REFERENCES public.categories(id),
  is_archived boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cải tiến bảng note_items
CREATE TABLE IF NOT EXISTS public.note_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric DEFAULT 0,
  total_price numeric GENERATED ALWAYS AS (quantity * unit_price) STORED,
  category_id uuid REFERENCES public.categories(id),
  purchase_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Thêm bảng note_collaborators để hỗ trợ chia sẻ ghi chú
CREATE TABLE IF NOT EXISTS public.note_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL DEFAULT 'view',  -- 'view', 'edit', 'admin'
  created_at timestamptz DEFAULT now(),
  UNIQUE(note_id, user_id)
);

-- Thêm bảng note_tags để quản lý tags
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Thêm trigger để tự động cập nhật trường updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Thêm trigger để tính tổng số tiền của ghi chú
CREATE OR REPLACE FUNCTION public.update_note_total_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- Tính lại tổng số tiền dựa trên tất cả items
  IF (TG_OP = 'DELETE') THEN
    UPDATE public.notes
    SET total_amount = COALESCE((
      SELECT SUM(total_price)
      FROM public.note_items
      WHERE note_id = OLD.note_id
    ), 0)
    WHERE id = OLD.note_id;
    
    RETURN OLD;
  ELSE
    UPDATE public.notes
    SET total_amount = COALESCE((
      SELECT SUM(total_price)
      FROM public.note_items
      WHERE note_id = NEW.note_id
    ), 0)
    WHERE id = NEW.note_id;
    
    RETURN NEW;
  END IF;
END;
$$;

-- Tạo các triggers
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.note_items
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER update_note_total_after_item_change
AFTER INSERT OR UPDATE OR DELETE ON public.note_items
FOR EACH ROW
EXECUTE FUNCTION public.update_note_total_amount();

-- Thêm các indices
CREATE INDEX idx_notes_owner_id ON public.notes(owner_id);
CREATE INDEX idx_notes_category_id ON public.notes(category_id);
CREATE INDEX idx_notes_store_id ON public.notes(store_id);
CREATE INDEX idx_notes_date ON public.notes(date);
CREATE INDEX idx_note_items_note_id ON public.note_items(note_id);
CREATE INDEX idx_note_items_category_id ON public.note_items(category_id);
CREATE INDEX idx_note_collaborators_note_id ON public.note_collaborators(note_id);
CREATE INDEX idx_note_collaborators_user_id ON public.note_collaborators(user_id);

-- Thiết lập Row Level Security
-- Enable RLS on all tables
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- RLS policies for notes
CREATE POLICY "Users can view their own notes"
ON public.notes
FOR SELECT
TO authenticated
USING (owner_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.note_collaborators
  WHERE note_id = notes.id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert their own notes"
ON public.notes
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own notes or notes they collaborate on"
ON public.notes
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.note_collaborators
    WHERE note_id = notes.id AND user_id = auth.uid() AND permission IN ('edit', 'admin')
  )
)
WITH CHECK (
  owner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.note_collaborators
    WHERE note_id = notes.id AND user_id = auth.uid() AND permission IN ('edit', 'admin')
  )
);

CREATE POLICY "Users can delete their own notes"
ON public.notes
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- RLS policies for note_items
CREATE POLICY "Users can view items of their notes"
ON public.note_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_items.note_id AND (
      owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.note_collaborators
        WHERE note_id = notes.id AND user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can insert items to their notes or notes they collaborate on"
ON public.note_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_items.note_id AND (
      owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.note_collaborators
        WHERE note_id = notes.id AND user_id = auth.uid() AND permission IN ('edit', 'admin')
      )
    )
  )
);

CREATE POLICY "Users can update items of their notes or notes they collaborate on"
ON public.note_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_items.note_id AND (
      owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.note_collaborators
        WHERE note_id = notes.id AND user_id = auth.uid() AND permission IN ('edit', 'admin')
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_items.note_id AND (
      owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.note_collaborators
        WHERE note_id = notes.id AND user_id = auth.uid() AND permission IN ('edit', 'admin')
      )
    )
  )
);

CREATE POLICY "Users can delete items of their notes or notes they collaborate on"
ON public.note_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_items.note_id AND (
      owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.note_collaborators
        WHERE note_id = notes.id AND user_id = auth.uid() AND permission IN ('edit', 'admin')
      )
    )
  )
);

-- RLS policies for categories (global categories visible to all)
CREATE POLICY "Categories are visible to all authenticated users"
ON public.categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin users can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

-- RLS policies for stores (similar to categories)
CREATE POLICY "Stores are visible to all authenticated users"
ON public.stores
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin users can manage stores"
ON public.stores
FOR ALL
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

-- RLS policies for note_collaborators
CREATE POLICY "Users can see collaborators of their notes"
ON public.note_collaborators
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_collaborators.note_id AND owner_id = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Note owners can manage collaborators"
ON public.note_collaborators
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_collaborators.note_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_collaborators.note_id AND owner_id = auth.uid()
  )
);

-- RLS policies for tags
CREATE POLICY "Tags are visible to all authenticated users"
ON public.tags
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create tags"
ON public.tags
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can manage their own tags"
ON public.tags
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- RLS policies for note_tags
CREATE POLICY "Users can see note tags"
ON public.note_tags
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_tags.note_id AND (
      owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.note_collaborators
        WHERE note_id = notes.id AND user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can manage tags for their notes"
ON public.note_tags
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_tags.note_id AND (
      owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.note_collaborators
        WHERE note_id = notes.id AND user_id = auth.uid() AND permission IN ('edit', 'admin')
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_tags.note_id AND (
      owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.note_collaborators
        WHERE note_id = notes.id AND user_id = auth.uid() AND permission IN ('edit', 'admin')
      )
    )
  )
);

-- Chèn dữ liệu mặc định vào bảng categories
INSERT INTO public.categories (name, icon, color)
VALUES
  ('Thực phẩm', 'nutrition', '#4CAF50'),
  ('Nhà cửa', 'home', '#2196F3'),
  ('Di chuyển', 'car', '#FF9800'),
  ('Quần áo', 'shirt', '#9C27B0'),
  ('Giải trí', 'music', '#E91E63'),
  ('Học tập', 'book', '#3F51B5'),
  ('Y tế', 'medical', '#F44336'),
  ('Khác', 'folder', '#607D8B')
ON CONFLICT (name) DO NOTHING;

-- Tạo function để migrate dữ liệu từ cấu trúc cũ sang cấu trúc mới
CREATE OR REPLACE FUNCTION migrate_to_new_structure()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  category_record RECORD;
BEGIN
  -- Kiểm tra sự tồn tại của bảng cũ
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
    -- Di chuyển dữ liệu từ expenses sang notes
    INSERT INTO public.notes (
      id, owner_id, title, description, date, total_amount, 
      created_at, updated_at
    )
    SELECT 
      gen_random_uuid(), -- tạo ID mới
      added_by, 
      title, 
      notes, 
      date, 
      total_amount,
      created_at, 
      updated_at
    FROM public.expenses
    ON CONFLICT DO NOTHING;
  END IF;

  -- Kiểm tra sự tồn tại của bảng expense_items
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expense_items') THEN
    -- Di chuyển dữ liệu từ expense_items sang note_items
    WITH expense_note_mapping AS (
      SELECT e.id as expense_id, n.id as note_id
      FROM public.expenses e
      JOIN public.notes n ON 
        n.title = e.title AND 
        n.description = e.notes AND
        n.owner_id = e.added_by
    )
    INSERT INTO public.note_items (
      id, note_id, name, description, quantity, unit_price,
      purchase_date, created_at, updated_at
    )
    SELECT 
      gen_random_uuid(), -- tạo ID mới
      m.note_id,
      ei.name,
      ei.notes,
      ei.amount,
      ei.unit_price,
      ei.purchase_date,
      now(),
      now()
    FROM public.expense_items ei
    JOIN expense_note_mapping m ON ei.expense_id = m.expense_id
    ON CONFLICT DO NOTHING;
  END IF;

  -- Cập nhật danh mục nếu đã có danh mục cho notes
  FOR category_record IN (SELECT id, name FROM public.categories)
  LOOP
    UPDATE public.notes
    SET category_id = category_record.id
    FROM public.expenses e
    WHERE 
      category_record.name = e.category AND
      notes.title = e.title AND
      notes.owner_id = e.added_by;

    UPDATE public.note_items
    SET category_id = category_record.id
    FROM public.expense_items ei
    WHERE 
      category_record.name = ei.category AND
      note_items.name = ei.name;
  END LOOP;
END;
$$;

-- Bỏ comment để chạy migration
-- SELECT migrate_to_new_structure(); 

-- Sau khi đã di chuyển dữ liệu, xóa các bảng cũ không còn sử dụng
-- DROP TABLE IF EXISTS public.expense_items CASCADE;
-- DROP TABLE IF EXISTS public.expenses CASCADE; 