"use client";

import CreateNoteForm from "@/components/notes/CreateNoteForm";

export default function CreateNotePage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tạo ghi chú mới</h1>
      <CreateNoteForm />
    </div>
  );
}
