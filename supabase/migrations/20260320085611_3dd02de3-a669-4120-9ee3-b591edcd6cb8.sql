-- Create notes table without generated column
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  search_vector tsvector
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update search_vector and updated_at
CREATE OR REPLACE FUNCTION public.notes_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title, '') || ' ' || coalesce(NEW.content, '') || ' ' || coalesce(array_to_string(NEW.tags, ' '), ''));
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER notes_search_update
  BEFORE INSERT OR UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.notes_search_vector_trigger();

-- Indexes
CREATE INDEX idx_notes_fulltext ON public.notes USING GIN (search_vector);
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);
CREATE INDEX idx_notes_pinned ON public.notes(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_notes_archived ON public.notes(user_id, is_archived) WHERE is_archived = true;

-- Full-text search function
CREATE OR REPLACE FUNCTION public.search_notes(search_query TEXT, p_user_id UUID)
RETURNS SETOF public.notes
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.notes
  WHERE user_id = p_user_id
    AND is_deleted = false
    AND (
      search_vector @@ plainto_tsquery('english', search_query)
      OR title ILIKE '%' || search_query || '%'
      OR content ILIKE '%' || search_query || '%'
    )
  ORDER BY
    ts_rank(search_vector, plainto_tsquery('english', search_query)) DESC,
    updated_at DESC;
$$;