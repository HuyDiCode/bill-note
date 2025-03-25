"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Note, NoteItem } from "@/types/notes";
import { formatCurrency } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, ArrowLeft } from "lucide-react";
import { NoteItemForm } from "@/components/notes/NoteItemForm";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NoteDetailProps {
  noteId: string;
}

export default function NoteDetail({ noteId }: NoteDetailProps) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [items, setItems] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("items");

  // Fetch note and items data
  const fetchNoteData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch note");
      }
      const data = await response.json();
      setNote(data.note);
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching note:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu chi tiết.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNoteData();
  }, [noteId]);

  // Delete note
  const handleDeleteNote = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      toast({
        title: "Xóa thành công",
        description: "Ghi chú đã được xóa.",
      });

      router.push("/notes");
      router.refresh();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa ghi chú.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      toast({
        title: "Xóa thành công",
        description: "Sản phẩm đã được xóa khỏi ghi chú.",
      });

      // Refresh data
      fetchNoteData();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <p className="text-lg font-medium mb-4">Không tìm thấy ghi chú</p>
        <Button onClick={() => router.push("/notes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/notes")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {note.title}
                </CardTitle>
                <div className="text-sm flex items-center mt-1">
                  <Badge variant="outline" className="mr-2">
                    {note.category}
                  </Badge>
                  {note.date && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Ngày:</span>
                      <span className="text-muted-foreground">
                        {format(new Date(note.date as string), "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/notes/${noteId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Sửa
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Xóa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc không?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Ghi chú này sẽ bị xóa
                        vĩnh viễn khỏi máy chủ.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteNote}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="items"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="items">
                    Danh sách sản phẩm ({items.length})
                  </TabsTrigger>
                  <TabsTrigger value="details">Chi tiết ghi chú</TabsTrigger>
                </TabsList>
                <TabsContent value="items" className="py-4">
                  {items.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Chưa có sản phẩm nào trong ghi chú này
                      </p>
                      <Button
                        onClick={() => setActiveTab("add")}
                        className="mx-auto"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm sản phẩm
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead className="text-right">SL</TableHead>
                            <TableHead className="text-right">
                              Đơn giá
                            </TableHead>
                            <TableHead className="text-right">
                              Thành tiền
                            </TableHead>
                            <TableHead className="text-right">
                              Thao tác
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">
                                {item.amount}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(Number(item.unit_price))}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(Number(item.total_price))}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    router.push(
                                      `/notes/${noteId}/items/${item.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Xác nhận xóa
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc muốn xóa sản phẩm này khỏi
                                        ghi chú?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteItem(item.id)
                                        }
                                      >
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </TabsContent>
                <TabsContent value="details" className="py-4">
                  <div className="space-y-4">
                    {note.store_name && (
                      <div>
                        <h3 className="font-medium">Cửa hàng</h3>
                        <p>{note.store_name}</p>
                      </div>
                    )}
                    {note.notes && (
                      <div>
                        <h3 className="font-medium">Ghi chú</h3>
                        <p className="whitespace-pre-line">{note.notes}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">Ngày tạo</h3>
                      <p>
                        {format(new Date(note.created_at), "HH:mm dd/MM/yyyy")}
                      </p>
                    </div>
                    {note.updated_at && (
                      <div>
                        <h3 className="font-medium">Cập nhật lần cuối</h3>
                        <p>
                          {format(
                            new Date(note.updated_at),
                            "HH:mm dd/MM/yyyy"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="add" className="py-4">
                  <NoteItemForm
                    noteId={noteId}
                    onSuccess={() => {
                      fetchNoteData();
                      setActiveTab("items");
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tổng số lượng:{" "}
                  {items.reduce((acc, item) => acc + Number(item.amount), 0)}
                </h3>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tổng chi phí
                </h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(Number(note.total_amount))}
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Thêm sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NoteItemForm noteId={noteId} onSuccess={fetchNoteData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
