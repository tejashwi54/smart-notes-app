import type { NoteFilter } from "@/hooks/useNotes";
import { BookOpen, StickyNote, Pin, Archive, Trash2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarProps {
  filter: NoteFilter;
  onFilterChange: (f: NoteFilter) => void;
  stats: { total: number; pinned: number; archived: number; trash: number };
  allTags: { tag: string; count: number }[];
  selectedTags: string[];
  onTagSelect: (tags: string[]) => void;
}

const navItems: { label: string; value: NoteFilter; icon: React.ElementType }[] = [
  { label: "All Notes", value: "all", icon: StickyNote },
  { label: "Pinned", value: "pinned", icon: Pin },
  { label: "Archived", value: "archived", icon: Archive },
  { label: "Trash", value: "trash", icon: Trash2 },
];

export function Sidebar({ filter, onFilterChange, stats, allTags, selectedTags, onTagSelect }: SidebarProps) {
  const statMap: Record<NoteFilter, number> = {
    all: stats.total,
    pinned: stats.pinned,
    archived: stats.archived,
    trash: stats.trash,
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagSelect(selectedTags.filter((t) => t !== tag));
    } else {
      onTagSelect([...selectedTags, tag]);
    }
  };

  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-sidebar-foreground">SmartNotes</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.value}
            onClick={() => onFilterChange(item.value)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              filter === item.value
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1 text-left">{item.label}</span>
            <span className="text-xs opacity-60">{statMap[item.value]}</span>
          </button>
        ))}

        {allTags.length > 0 && (
          <div className="pt-6">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Tag className="w-3.5 h-3.5 text-sidebar-foreground/50" />
              <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Tags
              </span>
            </div>
            <div className="px-3 flex flex-wrap gap-1.5">
              {allTags.slice(0, 15).map(({ tag, count }) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag} <span className="ml-1 opacity-60">{count}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40 text-center">
          SmartNotes v1.0
        </p>
      </div>
    </aside>
  );
}
