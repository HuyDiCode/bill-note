"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "../../hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Định nghĩa interface cho Note
interface Note {
  id: string;
  title: string;
  category: string;
  date: string;
  total_amount: number;
  store_name?: string;
  added_by: string;
  created_at: string;
}

// Danh sách các danh mục gợi ý
const CATEGORIES = [
  "Tất cả",
  "Thực phẩm",
  "Nhà cửa",
  "Di chuyển",
  "Quần áo",
  "Giải trí",
  "Học tập",
  "Y tế",
  "Khác",
];

export default function NotesList() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  // Lấy danh sách notes
  const fetchNotes = async (reset = false) => {
    if (reset) {
      setPage(1);
      setNotes([]);
    }

    const pageToFetch = reset ? 1 : page;
    setIsLoading(true);

    try {
      let url = `/api/notes?page=${pageToFetch}&pageSize=${PAGE_SIZE}`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      if (category && category !== "Tất cả") {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();

      if (reset) {
        setNotes(data.notes);
      } else {
        setNotes((prev) => [...prev, ...data.notes]);
      }

      setHasMore(data.notes.length === PAGE_SIZE);
      setPage(pageToFetch + 1);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách ghi chú.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    fetchNotes(true);
  }, []);

  // Tìm kiếm khi người dùng thay đổi điều kiện
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, category]);

  // Tạo note mới
  const handleCreateNote = () => {
    router.push("/notes/create");
  };

  // Xem chi tiết note
  const handleViewNote = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách ghi chú</h1>
        <Button onClick={handleCreateNote}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo ghi chú mới
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm ghi chú..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && notes.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="cursor-pointer overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có ghi chú nào</h3>
          <p className="text-muted-foreground mb-6">
            Bắt đầu bằng cách tạo ghi chú đầu tiên của bạn
          </p>
          <Button onClick={handleCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo ghi chú mới
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewNote(note.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                    <Badge variant="outline">{note.category}</Badge>
                  </div>
                  <CardDescription>
                    {format(new Date(note.date), "dd/MM/yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {note.store_name && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {note.store_name}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(note.created_at), "dd/MM/yyyy")}
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(Number(note.total_amount))}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center mt-6">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}

          {!isLoading && hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => fetchNotes()}
                className="w-full max-w-xs"
              >
                Tải thêm
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
