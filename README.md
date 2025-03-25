# Bill Note - Ứng dụng quản lý chi tiêu

Ứng dụng quản lý chi tiêu cá nhân và cộng tác với tính năng chia sẻ, đính kèm hóa đơn, và phân loại chi tiêu.

## Tính năng

- Đăng nhập và xác thực với Supabase Auth
- Quản lý chi tiêu theo danh mục
- Quét hóa đơn với AI (Google Gemini)
- Hỗ trợ đa ngôn ngữ (Tiếng Anh, Tiếng Việt)
- Giao diện người dùng hiện đại với Shadcn/UI
- Responsive design

## Cài đặt

1. Clone repository

   ```bash
   git clone https://github.com/HuyDiCode/bill-note.git
   cd bill-note
   ```

2. Cài đặt các dependencies

   ```bash
   npm install
   ```

3. Tạo file `.env.local` dựa trên file `.env.example`

   ```bash
   cp .env.example .env.local
   ```

4. Cấu hình Supabase trong file `.env.local`

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. Chạy migration để tạo các bảng trong Supabase

   ```sql
   -- Chạy file migration trong SQL Editor của Supabase
   -- File: src/migrations/create_notes_tables.sql
   ```

6. Khởi chạy ứng dụng
   ```bash
   npm run dev
   ```

## Khắc phục sự cố

### Lỗi "Failed to fetch notes"

Nguyên nhân: Lỗi này xảy ra khi bảng `notes` hoặc `profiles` chưa được tạo trong database Supabase.

Cách sửa:

1. Đăng nhập vào Supabase Dashboard
2. Mở SQL Editor
3. Chạy file migration `src/migrations/create_notes_tables.sql`
4. Hoặc chạy lệnh SQL sau để tạo các bảng cần thiết:

```sql
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
```

## Công nghệ sử dụng

- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth, Database, Storage)
- Tailwind CSS
- Shadcn/UI
- React Query
- i18next (Internationalization)
- Google Gemini AI

## License

MIT
