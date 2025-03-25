/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Định nghĩa interface để tránh sử dụng any
interface SupabaseClient {
  from: (table: string) => any;
  auth: {
    getUser: () => Promise<{ data: { user: any } }>;
  };
}

interface ExpenseItemWithPrice {
  total_price: string | number;
}

// POST: Thêm item mới vào note
export async function POST(
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
    const { data: note, error: checkError } = await supabase
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

    // Thêm item mới
    const { data: newItem, error } = await supabase
      .from("note_items")
      .insert({
        note_id: noteId,
        name: body.name,
        amount: body.amount || 1,
        unit_price: body.unit_price || 0,
        total_price: body.total_price || body.amount * body.unit_price || 0,
        category: body.category || null,
        // Thêm các trường mới nếu đã được cập nhật trong DB
        ...(body.store_name && { store_name: body.store_name }),
        ...(body.notes && { notes: body.notes }),
        ...(body.purchase_date && { purchase_date: body.purchase_date }),
      })
      .select();

    if (error) {
      throw error;
    }

    // Cập nhật tổng tiền của note
    await updateNoteTotalAmount(supabase, noteId);

    return NextResponse.json(newItem[0]);
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

// Hàm helper để cập nhật tổng tiền của note
async function updateNoteTotalAmount(supabase: SupabaseClient, noteId: string) {
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
