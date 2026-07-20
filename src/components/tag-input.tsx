"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { fuzzyMatch } from "@/lib/master-lists";

interface TagInputProps {
  label: string;
  placeholder: string;
  selected: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  maxVisible?: number;
}

export function TagInput({
  label,
  placeholder,
  selected,
  onChange,
  suggestions,
  maxVisible = 6,
}: TagInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const available = suggestions.filter((s) => !selected.includes(s));
  const matches = fuzzyMatch(available, query).slice(0, maxVisible);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setQuery("");
  };

  const removeTag = (tag: string) => {
    onChange(selected.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (matches.length > 0) {
        addTag(matches[0]);
      } else if (query.trim()) {
        addTag(query);
      }
    }
    if (e.key === "Backspace" && !query && selected.length > 0) {
      removeTag(selected[selected.length - 1]);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-xs text-muted-foreground">{label}</label>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <Badge key={tag} variant="default" className="text-xs gap-1 pr-1">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with dropdown */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length ? placeholder : `Type to search or add ${label.toLowerCase()}...`}
          className="h-9 text-xs"
        />

        {/* Dropdown */}
        {open && (query || matches.length > 0) && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-md max-h-48 overflow-y-auto">
            {matches.map((item) => (
              <button
                key={item}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(item);
                }}
              >
                {item}
              </button>
            ))}
            {query.trim() && !matches.includes(query.trim()) && !selected.includes(query.trim()) && (
              <button
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(query);
                }}
              >
                Add &quot;{query.trim()}&quot;
              </button>
            )}
            {!query && matches.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No more suggestions</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
