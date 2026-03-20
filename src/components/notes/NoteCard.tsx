import type { Note } from "@/hooks/useNotes";
import { Pin, Archive, Trash2, RotateCcw, ArchiveRestore } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface NoteCardProps {
  note: Note;
  searchQuery: string;
  onEdit: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  isTrash: boolean;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-warning/30 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function stripHtml(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

export function NoteCard({
  note,
  searchQuery,
  onEdit,
  onPin,
  onArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  isTrash,
}: NoteCardProps) {
  const plainContent = useMemo(() => stripHtml(note.content).slice(0, 200), [note.content]);
  const timeAgo = useMemo(() => {
    const d = new Date(note.updated_at);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  }, [note.updated_at]);

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card p-4 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5",
        note.is_pinned && "border-primary/30 bg-accent/30"
      )}
      onClick={onEdit}
    >
      {note.is_pinned && (
        <Pin className="absolute top-3 right-3 w-3.5 h-3.5 text-primary fill-primary" />
      )}

      <h3 className="font-semibold text-sm mb-1.5 pr-6 line-clamp-2">
        {note.title ? highlightText(note.title, searchQuery) : <span className="text-muted-foreground italic">Untitled</span>}
      </h3>

      {plainContent && (
        <p className="text-xs text-muted-foreground line-clamp-4 mb-3 leading-relaxed">
          {highlightText(plainContent, searchQuery)}
        </p>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {note.tags.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{note.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{timeAgo}</span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isTrash ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onRestore(); }}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Restore"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onPermanentDelete(); }}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onPin(); }}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title={note.is_pinned ? "Unpin" : "Pin"}
              >
                <Pin className={cn("w-3.5 h-3.5", note.is_pinned && "fill-current")} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onArchive(); }}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title={note.is_archived ? "Unarchive" : "Archive"}
              >
                {note.is_archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Move to trash"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
