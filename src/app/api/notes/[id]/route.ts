import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET: Lấy chi tiết note và các items
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = params.id;

  const supabase = await createClient();

  // Kiểm tra xác thực người dùng
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Lấy thông tin note
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .eq("added_by", user.id)
      .single();

    if (noteError) {
      if (noteError.code === "PGRST116") {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      throw noteError;
    }

    // Lấy các items của note
    const { data: items, error: itemsError } = await supabase
      .from("note_items")
      .select("*")
      .eq("note_id", noteId)
      .order("id");

    if (itemsError) {
      throw itemsError;
    }

    return NextResponse.json({
      note,
      items: items || [],
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note details" },
      { status: 500 }
    );
  }
}

// PATCH: Cập nhật thông tin note
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = params.id;

  const supabase = await createClient();

  // Kiểm tra xác thực người dùng
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Kiểm tra xem note có tồn tại và thuộc về người dùng không
    const { error: checkError } = await supabase
      .from("notes")
      .select("id")
      .eq("id", noteId)
      .eq("added_by", user.id)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      throw checkError;
    }

    const body = await request.json();

    // Cập nhật note
    const { data, error } = await supabase
      .from("notes")
      .update({
        title: body.title,
        category: body.category || null,
        notes: body.notes || null,
        store_name: body.store_name || null,
        date: body.date || new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa note
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = params.id;

  const supabase = await createClient();

  // Kiểm tra xác thực người dùng
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Kiểm tra xem note có tồn tại và thuộc về người dùng không
    const { error: checkError } = await supabase
      .from("notes")
      .select("id")
      .eq("id", noteId)
      .eq("added_by", user.id)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      throw checkError;
    }

    // Xóa note (các items sẽ tự động bị xóa nhờ ràng buộc CASCADE)
    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
