import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { NoteItem } from "@/types/notes";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema validation cho form tạo item
const noteItemSchema = z.object({
  name: z.string().min(1, "Tên món đồ không được để trống"),
  amount: z.coerce.number().min(1, "Số lượng phải lớn hơn 0").default(1),
  unit_price: z.coerce.number().min(0, "Đơn giá không được âm").default(0),
  category: z.string().optional(),
  purchase_date: z.date().optional(),
  store_name: z.string().optional(),
  notes: z.string().optional(),
});

type NoteItemFormValues = z.infer<typeof noteItemSchema>;

interface NoteItemFormProps {
  noteId: string;
  onSuccess: () => void;
  categories?: string[];
  stores?: string[];
  itemToEdit?: NoteItem;
  onCancel?: () => void;
}

/**
 * Form tạo/chỉnh sửa item trong ghi chú
 */
export function NoteItemForm({
  noteId,
  onSuccess,
  categories = [],
  stores = [],
  itemToEdit,
  onCancel,
}: NoteItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(itemToEdit);

  // Khởi tạo form với react-hook-form và zod validation
  const form = useForm<NoteItemFormValues>({
    resolver: zodResolver(noteItemSchema),
    defaultValues: {
      name: "",
      amount: 1,
      unit_price: 0,
      category: "",
      notes: "",
      store_name: "",
    },
  });

  // Load dữ liệu item cần chỉnh sửa vào form
  useEffect(() => {
    if (itemToEdit) {
      form.reset({
        name: itemToEdit.name,
        amount: itemToEdit.amount,
        unit_price: itemToEdit.unit_price || 0,
        category: itemToEdit.category || "",
        purchase_date: itemToEdit.purchase_date
          ? new Date(itemToEdit.purchase_date)
          : undefined,
        store_name: itemToEdit.store_name || "",
        notes: itemToEdit.notes || "",
      });
    }
  }, [itemToEdit, form]);

  // Xử lý khi submit form
  const onSubmit = async (values: NoteItemFormValues) => {
    setIsSubmitting(true);

    try {
      const endpoint = isEditMode
        ? `/api/notes/${noteId}/items/${itemToEdit?.id}`
        : `/api/notes/${noteId}/items`;

      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          purchase_date: values.purchase_date
            ? format(values.purchase_date, "yyyy-MM-dd")
            : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Đã xảy ra lỗi khi lưu dữ liệu");
      }

      form.reset({
        name: "",
        amount: 1,
        unit_price: 0,
        category: "",
        notes: "",
        store_name: "",
      });

      // Gọi callback khi thành công
      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính tổng giá trị item
  const calculateTotal = (): number => {
    const amount = form.watch("amount") || 0;
    const unitPrice = form.watch("unit_price") || 0;
    return amount * unitPrice;
  };

  // Format số thành chuỗi tiền tệ
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên món đồ</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên món đồ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Nhập số lượng..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đơn giá</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Nhập đơn giá..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Tổng: {formatCurrency(calculateTotal())}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ngày mua</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="store_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cửa hàng</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cửa hàng" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store} value={store}>
                      {store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập ghi chú về món đồ này..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Đang lưu..."
              : isEditMode
              ? "Cập nhật"
              : "Thêm món đồ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
