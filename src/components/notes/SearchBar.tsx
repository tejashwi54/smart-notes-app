import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("smartnotes-recent-searches") || "[]");
    } catch {
      return [];
    }
  });
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    if (value.trim() && !recentSearches.includes(value.trim())) {
      const timeout = setTimeout(() => {
        const updated = [value.trim(), ...recentSearches.filter((s) => s !== value.trim())].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("smartnotes-recent-searches", JSON.stringify(updated));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [value]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search notes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowRecent(true)}
        onBlur={() => setTimeout(() => setShowRecent(false), 200)}
        className="pl-9 pr-8 h-10 bg-secondary/50 border-0 focus-visible:ring-1"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {showRecent && !value && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg p-2 z-50">
          <p className="text-xs text-muted-foreground px-2 mb-1">Recent searches</p>
          {recentSearches.map((s) => (
            <button
              key={s}
              onMouseDown={() => onChange(s)}
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
