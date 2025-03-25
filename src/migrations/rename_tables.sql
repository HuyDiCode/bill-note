-- Rename expenses table to notes
ALTER TABLE IF EXISTS "expenses" RENAME TO "notes";

-- Rename expense_items table to note_items
ALTER TABLE IF EXISTS "expense_items" RENAME TO "note_items";

-- Rename the foreign key column in note_items
ALTER TABLE IF EXISTS "note_items" 
RENAME COLUMN "expense_id" TO "note_id";

-- Update the foreign key constraint 
ALTER TABLE IF EXISTS "note_items" 
DROP CONSTRAINT IF EXISTS "expense_items_expense_id_fkey";

ALTER TABLE IF EXISTS "note_items" 
ADD CONSTRAINT "note_items_note_id_fkey" 
FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE;

-- Update any index names if they exist
ALTER INDEX IF EXISTS "expenses_pkey" RENAME TO "notes_pkey";
ALTER INDEX IF EXISTS "expense_items_pkey" RENAME TO "note_items_pkey";
ALTER INDEX IF EXISTS "expenses_added_by_idx" RENAME TO "notes_added_by_idx";
ALTER INDEX IF EXISTS "expenses_date_idx" RENAME TO "notes_date_idx"; 