import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Định nghĩa interface để tránh sử dụng any
interface ExpenseItemWithPrice {
  total_price: string | number;
}

// DELETE: Xóa item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const noteId = params.id;
  const itemId = params.itemId;

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

    // Kiểm tra xem item có tồn tại và thuộc về note này không
    const { error: itemCheckError } = await supabase
      .from("note_items")
      .select("id")
      .eq("id", itemId)
      .eq("note_id", noteId)
      .single();

    if (itemCheckError) {
      if (itemCheckError.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      throw itemCheckError;
    }

    // Xóa item
    const { error } = await supabase
      .from("note_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      throw error;
    }

    // Cập nhật tổng tiền của note
    await updateNoteTotalAmount(supabase, noteId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

// PATCH: Cập nhật thông tin của item
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const noteId = params.id;
  const itemId = params.itemId;

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

    // Kiểm tra xem item có tồn tại và thuộc về note này không
    const { error: itemCheckError } = await supabase
      .from("note_items")
      .select("id")
      .eq("id", itemId)
      .eq("note_id", noteId)
      .single();

    if (itemCheckError) {
      if (itemCheckError.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      throw itemCheckError;
    }

    // Xử lý body request
    const body = await request.json();

    // Tính total_price nếu cung cấp amount và unit_price
    if (body.amount && body.unit_price) {
      body.total_price = parseFloat(body.amount) * parseFloat(body.unit_price);
    }

    // Cập nhật item
    const { data, error } = await supabase
      .from("note_items")
      .update(body)
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Cập nhật tổng tiền của note
    await updateNoteTotalAmount(supabase, noteId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// Hàm helper để cập nhật tổng tiền của note
async function updateNoteTotalAmount(supabase: any, noteId: string) {
  try {
    // Tính tổng từ các items
    const { data: items, error: itemsError } = await supabase
      .from("note_items")
      .select("total_price")
      .eq("note_id", noteId);

    if (itemsError) throw itemsError;

    const totalAmount = items.reduce(
      (sum: number, item: ExpenseItemWithPrice) =>
        sum + (parseFloat(item.total_price as string) || 0),
      0
    );

    // Cập nhật note
    const { error } = await supabase
      .from("notes")
      .update({ total_amount: totalAmount })
      .eq("id", noteId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating note total amount:", error);
  }
}
