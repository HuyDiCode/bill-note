"use client";

import NoteDetail from "@/components/notes/NoteDetail";

export default function NoteDetailPage({ params }: { params: { id: string } }) {
  return <NoteDetail noteId={params.id} />;
}
