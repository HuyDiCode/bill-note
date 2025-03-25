import { useState, useEffect, useCallback } from "react";
import { Note, NoteItem } from "@/types/notes";
import { toast } from "./use-toast";

interface UseNotesReturn {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
  fetchNotes: (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;
  createNote: (note: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, note: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  categories: string[];
  stores: string[];
  addItem: (noteId: string, item: Partial<NoteItem>) => Promise<NoteItem>;
  updateItem: (
    noteId: string,
    itemId: string,
    item: Partial<NoteItem>
  ) => Promise<NoteItem>;
  removeItem: (itemId: string, noteId: string) => Promise<void>;
  useNoteWithItems: (noteId: string) => {
    noteData: {
      note: Note | null;
      items: NoteItem[];
    };
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    removeNote: () => Promise<void>;
  };
  removeNote: (noteId: string) => Promise<void>;
  totalNotes: number;
  currentPage: number;
}

/**
 * Custom hook để quản lý các ghi chú chi tiêu
 * @param userId ID của người dùng hiện tại
 * @returns Các hàm và dữ liệu liên quan đến ghi chú chi tiêu
 */
export function useNotes(userId: string): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<string[]>([
    "Thực phẩm",
    "Nhà cửa",
    "Di chuyển",
    "Quần áo",
    "Giải trí",
    "Học tập",
    "Y tế",
    "Khác",
  ]);
  const [stores, setStores] = useState<string[]>([
    "Siêu thị",
    "Chợ",
    "Cửa hàng tiện lợi",
    "Trung tâm thương mại",
    "Cửa hàng online",
    "Khác",
  ]);
  const [totalNotes, setTotalNotes] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  /**
   * Lấy danh sách ghi chú từ API
   */
  const fetchNotes = useCallback(
    async (params?: {
      page?: number;
      pageSize?: number;
      category?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;

        let url = `/api/notes?page=${page}&pageSize=${pageSize}`;

        if (params?.category) {
          url += `&category=${encodeURIComponent(params.category)}`;
        }

        if (params?.search) {
          url += `&search=${encodeURIComponent(params.search)}`;
        }

        if (params?.dateFrom) {
          url += `&dateFrom=${encodeURIComponent(params.dateFrom)}`;
        }

        if (params?.dateTo) {
          url += `&dateTo=${encodeURIComponent(params.dateTo)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data = await response.json();
        setNotes(data.notes || []);
        setTotalNotes(data.total || 0);
        setCurrentPage(data.page || 1);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error fetching notes:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  /**
   * Tạo ghi chú mới
   * @param note Thông tin ghi chú
   * @returns Ghi chú đã tạo
   */
  const createNote = async (note: Partial<Note>): Promise<Note> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...note,
          added_by: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create note");
      }

      const newNote = await response.json();

      // Cập nhật state
      setNotes((prev) => [newNote, ...prev]);

      // Cập nhật danh sách danh mục nếu là danh mục mới
      if (note.category && !categories.includes(note.category)) {
        setCategories((prev) => [...prev, note.category as string]);
      }

      // Cập nhật danh sách cửa hàng nếu là cửa hàng mới
      if (note.store_name && !stores.includes(note.store_name)) {
        setStores((prev) => [...prev, note.store_name as string]);
      }

      return newNote;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error creating note:", error);
      throw error;
    }
  };

  /**
   * Cập nhật thông tin ghi chú
   * @param id ID của ghi chú
   * @param note Thông tin cập nhật
   * @returns Ghi chú đã cập nhật
   */
  const updateNote = async (id: string, note: Partial<Note>): Promise<Note> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update note");
      }

      const updatedNote = await response.json();

      // Cập nhật state
      setNotes((prev) =>
        prev.map((item) => (item.id === id ? updatedNote : item))
      );

      // Cập nhật danh sách danh mục nếu là danh mục mới
      if (note.category && !categories.includes(note.category)) {
        setCategories((prev) => [...prev, note.category as string]);
      }

      // Cập nhật danh sách cửa hàng nếu là cửa hàng mới
      if (note.store_name && !stores.includes(note.store_name)) {
        setStores((prev) => [...prev, note.store_name as string]);
      }

      return updatedNote;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error updating note:", error);
      throw error;
    }
  };

  /**
   * Xóa ghi chú
   * @param id ID của ghi chú
   */
  const deleteNote = async (id: string): Promise<void> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete note");
      }

      // Cập nhật state
      setNotes((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error deleting note:", error);
      throw error;
    }
  };

  /**
   * Thêm item vào ghi chú
   * @param noteId ID của ghi chú
   * @param item Thông tin item
   * @returns Item đã thêm
   */
  const addItem = async (
    noteId: string,
    item: Partial<NoteItem>
  ): Promise<NoteItem> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(`/api/notes/${noteId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add item");
      }

      const newItem = await response.json();

      // Cập nhật danh sách danh mục nếu là danh mục mới
      if (item.category && !categories.includes(item.category)) {
        setCategories((prev) => [...prev, item.category as string]);
      }

      // Cập nhật danh sách cửa hàng nếu là cửa hàng mới
      if (item.store_name && !stores.includes(item.store_name)) {
        setStores((prev) => [...prev, item.store_name as string]);
      }

      return newItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error adding item:", error);
      throw error;
    }
  };

  /**
   * Cập nhật thông tin item
   * @param noteId ID của ghi chú
   * @param itemId ID của item
   * @param item Thông tin cập nhật
   * @returns Item đã cập nhật
   */
  const updateItem = async (
    noteId: string,
    itemId: string,
    item: Partial<NoteItem>
  ): Promise<NoteItem> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(`/api/notes/${noteId}/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update item");
      }

      const updatedItem = await response.json();

      // Cập nhật danh sách danh mục nếu là danh mục mới
      if (item.category && !categories.includes(item.category)) {
        setCategories((prev) => [...prev, item.category as string]);
      }

      // Cập nhật danh sách cửa hàng nếu là cửa hàng mới
      if (item.store_name && !stores.includes(item.store_name)) {
        setStores((prev) => [...prev, item.store_name as string]);
      }

      return updatedItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error updating item:", error);
      throw error;
    }
  };

  /**
   * Xóa item khỏi ghi chú
   * @param itemId ID của item
   * @param noteId ID của ghi chú
   */
  const removeItem = async (itemId: string, noteId: string): Promise<void> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(`/api/notes/${noteId}/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete item");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error removing item:", error);
      throw error;
    }
  };

  /**
   * Xóa ghi chú
   * @param noteId ID của ghi chú
   */
  const removeNote = async (noteId: string): Promise<void> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete note");
      }

      // Cập nhật state
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error removing note:", error);
      throw error;
    }
  };

  /**
   * Custom hook để lấy chi tiết ghi chú và các items
   * @param noteId ID của ghi chú
   * @returns Chi tiết ghi chú và các items
   */
  const useNoteWithItems = (noteId: string) => {
    const [noteData, setNoteData] = useState<{
      note: Note | null;
      items: NoteItem[];
    }>({
      note: null,
      items: [],
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchNoteData = useCallback(async () => {
      if (!userId || !noteId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/notes/${noteId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch note details");
        }

        const data = await response.json();
        setNoteData({
          note: data.note || null,
          items: data.items || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error fetching note details:", err);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu ghi chú",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, [userId, noteId]);

    useEffect(() => {
      fetchNoteData();
    }, [fetchNoteData]);

    const removeNoteAndRedirect = async () => {
      if (!noteId) return;

      try {
        await removeNote(noteId);
        toast({
          title: "Thành công",
          description: "Đã xóa ghi chú",
        });
        // Chuyển hướng sẽ được xử lý ở component
      } catch (error) {
        console.error("Error removing note in component:", error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa ghi chú",
          variant: "destructive",
        });
      }
    };

    return {
      noteData,
      isLoading,
      error,
      refetch: fetchNoteData,
      removeNote: removeNoteAndRedirect,
    };
  };

  // Load initial data
  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId, fetchNotes]);

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    categories,
    stores,
    addItem,
    updateItem,
    removeItem,
    useNoteWithItems,
    removeNote,
    totalNotes,
    currentPage,
  };
}
