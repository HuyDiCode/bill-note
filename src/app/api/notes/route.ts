import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createErrorResponse } from "@/utils/i18n";
import { NOTE_ERRORS, AUTH_ERRORS } from "@/constants/errors";

// GET: Lấy danh sách notes
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const category = searchParams.get("category") || null;
  const search = searchParams.get("search") || null;
  const dateFrom = searchParams.get("dateFrom") || null;
  const dateTo = searchParams.get("dateTo") || null;

  try {
    const supabase = await createClient();

    // Kiểm tra xác thực người dùng
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(createErrorResponse(AUTH_ERRORS.UNAUTHORIZED), {
        status: 401,
      });
    }

    // Kiểm tra xem bảng notes có tồn tại không
    const { error: tableCheckError } = await supabase
      .from("notes")
      .select("id")
      .limit(1);

    // Nếu có lỗi liên quan đến bảng không tồn tại hoặc không có quyền truy cập
    if (tableCheckError) {
      console.error("Table check error:", tableCheckError);

      // Trả về một mảng trống thay vì lỗi
      return NextResponse.json({
        notes: [],
        total: 0,
        page,
        pageSize,
      });
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // Xây dựng query
    let query = supabase.from("notes").select("*", { count: "exact" });

    // Chỉ lấy các notes của người dùng hiện tại
    query = query.eq("added_by", user.id);

    // Sắp xếp theo ngày giảm dần (mới nhất trước)
    query = query.order("date", { ascending: false });

    // Áp dụng các bộ lọc nếu có
    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,store_name.ilike.%${search}%`);
    }

    if (dateFrom) {
      query = query.gte("date", dateFrom);
    }

    if (dateTo) {
      query = query.lte("date", dateTo);
    }

    // Thực hiện phân trang
    query = query.range(start, end);

    const { data: notes, count, error } = await query;

    if (error) {
      console.error("Query error:", error);
      throw error;
    }

    return NextResponse.json({
      notes: notes || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(createErrorResponse(NOTE_ERRORS.NOT_FOUND), {
      status: 500,
    });
  }
}

// POST: Tạo note mới
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Kiểm tra xác thực người dùng
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(createErrorResponse(AUTH_ERRORS.UNAUTHORIZED), {
        status: 401,
      });
    }

    const body = await request.json();

    // Tạo note mới
    const { data, error } = await supabase
      .from("notes")
      .insert({
        title: body.title,
        added_by: user.id,
        total_amount: 0, // Khởi tạo với tổng tiền = 0
        date: body.date || new Date().toISOString().split("T")[0], // Sử dụng ngày từ form hoặc ngày hiện tại
        category: body.category || null,
        notes: body.notes || null,
        store_name: body.store_name || null,
      })
      .select();

    if (error) {
      console.error("Create note error:", error);
      throw error;
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(createErrorResponse(NOTE_ERRORS.CREATION_FAILED), {
      status: 500,
    });
  }
}
