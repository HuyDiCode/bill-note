-- Tạo bảng notes tương tự như bảng expenses
CREATE TABLE IF NOT EXISTS "public"."notes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "added_by" uuid NOT NULL,
  "title" text NOT NULL,
  "total_amount" numeric DEFAULT 0,
  "date" date DEFAULT CURRENT_DATE,
  "category" text,
  "notes" text,
  "store_name" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- Tạo bảng note_items tương tự như bảng expense_items
CREATE TABLE IF NOT EXISTS "public"."note_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "note_id" uuid NOT NULL,
  "name" text NOT NULL,
  "amount" numeric NOT NULL DEFAULT 1,
  "unit_price" numeric DEFAULT 0,
  "total_price" numeric DEFAULT 0,
  "category" text,
  "purchase_date" date,
  "store_name" text,
  "notes" text,
  CONSTRAINT "note_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "note_items_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE
);

-- Thêm các index cần thiết
CREATE INDEX IF NOT EXISTS "notes_added_by_idx" ON "public"."notes" ("added_by");
CREATE INDEX IF NOT EXISTS "notes_date_idx" ON "public"."notes" ("date");
CREATE INDEX IF NOT EXISTS "note_items_note_id_idx" ON "public"."note_items" ("note_id");

-- Thêm trigger để tự động cập nhật trường updated_at
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
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

CREATE TRIGGER "notes_updated_at_trigger"
BEFORE UPDATE ON "public"."notes"
FOR EACH ROW
EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Tạo RLS policies để bảo vệ dữ liệu
ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."note_items" ENABLE ROW LEVEL SECURITY;

-- Policies cho bảng notes
CREATE POLICY "Notes are viewable by owner" 
ON "public"."notes"
FOR SELECT 
TO authenticated
USING ((added_by = (SELECT auth.uid())));

CREATE POLICY "Notes are insertable by authenticated users" 
ON "public"."notes"
FOR INSERT 
TO authenticated
WITH CHECK ((added_by = (SELECT auth.uid())));

CREATE POLICY "Notes are updatable by owner" 
ON "public"."notes"
FOR UPDATE 
TO authenticated
USING ((added_by = (SELECT auth.uid())))
WITH CHECK ((added_by = (SELECT auth.uid())));

CREATE POLICY "Notes are deletable by owner" 
ON "public"."notes"
FOR DELETE 
TO authenticated
USING ((added_by = (SELECT auth.uid())));

-- Policies cho bảng note_items
CREATE POLICY "Note items are viewable by note owner" 
ON "public"."note_items"
FOR SELECT 
TO authenticated
USING ((note_id IN (SELECT id FROM "public"."notes" WHERE added_by = (SELECT auth.uid()))));

CREATE POLICY "Note items are insertable by note owner" 
ON "public"."note_items"
FOR INSERT 
TO authenticated
WITH CHECK ((note_id IN (SELECT id FROM "public"."notes" WHERE added_by = (SELECT auth.uid()))));

CREATE POLICY "Note items are updatable by note owner" 
ON "public"."note_items"
FOR UPDATE 
TO authenticated
USING ((note_id IN (SELECT id FROM "public"."notes" WHERE added_by = (SELECT auth.uid()))))
WITH CHECK ((note_id IN (SELECT id FROM "public"."notes" WHERE added_by = (SELECT auth.uid()))));

CREATE POLICY "Note items are deletable by note owner" 
ON "public"."note_items"
FOR DELETE 
TO authenticated
USING ((note_id IN (SELECT id FROM "public"."notes" WHERE added_by = (SELECT auth.uid()))));

-- Migration cho dữ liệu (nếu cần)
-- Thêm hàm để di chuyển dữ liệu từ expenses sang notes
CREATE OR REPLACE FUNCTION migrate_expenses_to_notes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Chèn dữ liệu từ expenses sang notes
  INSERT INTO "public"."notes" (id, added_by, title, total_amount, date, category, notes, store_name, created_at, updated_at)
  SELECT id, added_by, title, total_amount, date, category, notes, store_name, created_at, updated_at
  FROM "public"."expenses";

  -- Chèn dữ liệu từ expense_items sang note_items
  INSERT INTO "public"."note_items" (id, note_id, name, amount, unit_price, total_price, category)
  SELECT id, expense_id, name, amount, unit_price, total_price, category
  FROM "public"."expense_items";
END;
$$;

-- Chạy migration sau khi tạo bảng
-- SELECT migrate_expenses_to_notes(); 