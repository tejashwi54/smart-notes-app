import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotes, type NoteFilter } from "@/hooks/useNotes";
import { useDebounce } from "@/hooks/useDebounce";
import { useTheme } from "@/hooks/useTheme";
import { Sidebar } from "@/components/notes/Sidebar";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { SearchBar } from "@/components/notes/SearchBar";
import { DashboardPanel } from "@/components/notes/DashboardPanel";
import { Button } from "@/components/ui/button";
import { Plus, Moon, Sun, LogOut, LayoutDashboard, StickyNote, Menu, X } from "lucide-react";
import type { Note } from "@/hooks/useNotes";
import { motion, AnimatePresence } from "framer-motion";

export default function NotesPage() {
  const { user, signOut } = useAuth();
  const {
    notes,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    searchNotes,
    createNote,
    updateNote,
    deleteNotePermanently,
    allTags,
    stats,
  } = useNotes(user?.id);

  const { isDark, toggle: toggleTheme } = useTheme();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch) {
      searchNotes(debouncedSearch);
    } else {
      searchNotes("");
    }
  }, [debouncedSearch, searchNotes]);

  const handleCreateNote = useCallback(async (title: string, content: string, tags: string[]) => {
    const note = await createNote(title, content, tags);
    if (note) {
      setIsCreating(false);
    }
  }, [createNote]);

  const handleUpdateNote = useCallback(async (title: string, content: string, tags: string[]) => {
    if (!editingNote) return;
    await updateNote(editingNote.id, { title, content, tags });
    setEditingNote(null);
  }, [editingNote, updateNote]);

  const handleFilterChange = useCallback((f: NoteFilter) => {
    setFilter(f);
    setSidebarOpen(false);
  }, [setFilter]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          filter={filter}
          onFilterChange={handleFilterChange}
          stats={stats}
          allTags={allTags}
          selectedTags={selectedTags}
          onTagSelect={(tags) => setSelectedTags(tags)}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex-1 max-w-xl">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDashboard(!showDashboard)}
                className={showDashboard ? "text-primary" : ""}
              >
                {showDashboard ? <StickyNote className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {showDashboard ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <DashboardPanel stats={stats} allTags={allTags} notes={notes} />
              </motion.div>
            ) : (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold capitalize">
                    {filter === "all" ? "All Notes" : `${filter} Notes`}
                  </h2>
                  {filter !== "trash" && (
                    <Button onClick={() => setIsCreating(true)} size="sm">
                      <Plus className="w-4 h-4 mr-1" /> New Note
                    </Button>
                  )}
                </div>

                <NotesGrid
                  notes={notes}
                  loading={loading}
                  searchQuery={searchQuery}
                  onEdit={setEditingNote}
                  onPin={(id, pinned) => updateNote(id, { is_pinned: !pinned })}
                  onArchive={(id, archived) => updateNote(id, { is_archived: !archived })}
                  onDelete={(id) => updateNote(id, { is_deleted: true })}
                  onRestore={(id) => updateNote(id, { is_deleted: false })}
                  onPermanentDelete={deleteNotePermanently}
                  filter={filter}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isCreating && (
          <NoteEditor
            onSave={handleCreateNote}
            onClose={() => setIsCreating(false)}
            allTags={allTags.map((t) => t.tag)}
          />
        )}
        {editingNote && (
          <NoteEditor
            note={editingNote}
            onSave={handleUpdateNote}
            onClose={() => setEditingNote(null)}
            allTags={allTags.map((t) => t.tag)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
