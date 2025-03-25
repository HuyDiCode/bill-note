-- Script kiểm tra thông tin về các bảng trong schema public
-- 1. Danh sách tất cả các bảng và views
SELECT 
  table_name,
  table_type,
  pg_catalog.obj_description(pgc.oid, 'pg_class') as table_comment 
FROM information_schema.tables t
JOIN pg_catalog.pg_class pgc ON pgc.relname = t.table_name
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Danh sách các cột của từng bảng
SELECT 
  t.table_name, 
  c.column_name, 
  c.data_type, 
  c.is_nullable,
  c.column_default,
  pg_catalog.col_description(pgc.oid, c.ordinal_position) as column_comment
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
JOIN pg_catalog.pg_class pgc ON pgc.relname = t.table_name
WHERE t.table_schema = 'public' 
ORDER BY t.table_name, c.ordinal_position;

-- 3. Danh sách các trigger đã được tạo
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 4. Danh sách các policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Danh sách các ràng buộc
SELECT 
  tc.table_schema, 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 6. Danh sách các indices
SELECT 
  tablename, 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- 7. Danh sách các sequences
SELECT 
  sequence_name, 
  data_type,
  start_value,
  minimum_value,
  maximum_value,
  increment
FROM information_schema.sequences
WHERE sequence_schema = 'public';

-- 8. Danh sách các enum types
SELECT 
  t.typname AS enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY enum_name
ORDER BY enum_name; 