"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface SearchBarProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
  compact?: boolean;
}

interface SearchFilters {
  source: string;
  dateRange: string;
  location: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search jobs, skills, or companies...",
  showFilters = true,
  compact = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    source: "all",
    dateRange: "all",
    location: "all",
  });

  const handleSearch = () => {
    onSearch?.(query, filters);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={placeholder}
          className={`pl-11 pr-24 ${compact ? "h-11" : "h-13 text-sm"} border-border bg-background`}
        />
        <Button
          onClick={handleSearch}
          size="sm"
          className={`absolute right-2 ${compact ? "h-7 px-3 text-xs" : "h-9 px-4 text-xs"} tracking-wide`}
        >
          Search
        </Button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-2 justify-center">
          <Select
            onValueChange={(v: string | null) => setFilters({ ...filters, source: v ?? "all" })}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="greenhouse">Greenhouse</SelectItem>
              <SelectItem value="lever">Lever</SelectItem>
              <SelectItem value="ashby">Ashby</SelectItem>
              <SelectItem value="workday">Workday</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v: string | null) => setFilters({ ...filters, dateRange: v ?? "all" })}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Date Added" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">This Week</SelectItem>
              <SelectItem value="30d">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v: string | null) => setFilters({ ...filters, location: v ?? "all" })}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anywhere</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="eu">Europe</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
