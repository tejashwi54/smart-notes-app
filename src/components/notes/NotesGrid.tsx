import type { Note, NoteFilter } from "@/hooks/useNotes";
import { NoteCard } from "./NoteCard";
import { motion } from "framer-motion";
import { StickyNote, Search, Trash2 } from "lucide-react";

interface NotesGridProps {
  notes: Note[];
  loading: boolean;
  searchQuery: string;
  onEdit: (note: Note) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onArchive: (id: string, isArchived: boolean) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  filter: NoteFilter;
}

export function NotesGrid({
  notes,
  loading,
  searchQuery,
  onEdit,
  onPin,
  onArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  filter,
}: NotesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-card animate-pulse border"
          />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-muted-foreground"
      >
        {searchQuery ? (
          <>
            <Search className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm">Try a different search term</p>
          </>
        ) : filter === "trash" ? (
          <>
            <Trash2 className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">Trash is empty</p>
          </>
        ) : (
          <>
            <StickyNote className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No notes yet</p>
            <p className="text-sm">Create your first note to get started</p>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note, i) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <NoteCard
            note={note}
            searchQuery={searchQuery}
            onEdit={() => onEdit(note)}
            onPin={() => onPin(note.id, note.is_pinned)}
            onArchive={() => onArchive(note.id, note.is_archived)}
            onDelete={() => onDelete(note.id)}
            onRestore={() => onRestore(note.id)}
            onPermanentDelete={() => onPermanentDelete(note.id)}
            isTrash={filter === "trash"}
          />
        </motion.div>
      ))}
    </div>
  );
}
