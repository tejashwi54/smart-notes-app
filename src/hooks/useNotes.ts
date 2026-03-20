import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Note = Tables<"notes">;

export type NoteFilter = "all" | "pinned" | "archived" | "trash";

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NoteFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (!error && data) setNotes(data);
    setLoading(false);
  }, [userId]);

  const searchNotes = useCallback(async (query: string) => {
    if (!userId || !query.trim()) {
      fetchNotes();
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("search_notes", {
      search_query: query,
      p_user_id: userId,
    });
    if (!error && data) setNotes(data as Note[]);
    setLoading(false);
  }, [userId, fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(async (title: string, content: string, tags: string[]) => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: userId, title, content, tags })
      .select()
      .single();
    if (!error && data) {
      setNotes((prev) => [data, ...prev]);
      return data;
    }
    return null;
  }, [userId]);

  const updateNote = useCallback(async (id: string, updates: Partial<Pick<Note, "title" | "content" | "tags" | "is_pinned" | "is_archived" | "is_deleted">>) => {
    const { data, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
    }
  }, []);

  const deleteNotePermanently = useCallback(async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const filteredNotes = useMemo(() => {
    let result = notes;

    switch (filter) {
      case "all":
        result = result.filter((n) => !n.is_archived && !n.is_deleted);
        break;
      case "pinned":
        result = result.filter((n) => n.is_pinned && !n.is_deleted);
        break;
      case "archived":
        result = result.filter((n) => n.is_archived && !n.is_deleted);
        break;
      case "trash":
        result = result.filter((n) => n.is_deleted);
        break;
    }

    if (selectedTags.length > 0) {
      result = result.filter((n) =>
        selectedTags.some((tag) => n.tags?.includes(tag))
      );
    }

    return result;
  }, [notes, filter, selectedTags]);

  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    notes.forEach((n) => {
      n.tags?.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [notes]);

  const stats = useMemo(() => ({
    total: notes.filter((n) => !n.is_deleted).length,
    pinned: notes.filter((n) => n.is_pinned && !n.is_deleted).length,
    archived: notes.filter((n) => n.is_archived && !n.is_deleted).length,
    trash: notes.filter((n) => n.is_deleted).length,
  }), [notes]);

  return {
    notes: filteredNotes,
    allNotes: notes,
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
    fetchNotes,
    allTags,
    stats,
  };
}
