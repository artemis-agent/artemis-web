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
  placeholder = "What role should I hunt for?",
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
    <div className="w-full max-w-2xl mx-auto space-y-2.5">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={placeholder}
          className={`pl-9 pr-20 ${compact ? "h-10" : "h-11"} text-[13px]`}
        />
        <Button
          onClick={handleSearch}
          size="sm"
          className="absolute right-1.5 h-7 px-3 text-[11px]"
        >
          Search
        </Button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-2 justify-center">
          <Select
            onValueChange={(v: string | null) => setFilters({ ...filters, source: v ?? "all" })}
          >
            <SelectTrigger className="w-[130px] h-7 text-[11px]">
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
            <SelectTrigger className="w-[120px] h-7 text-[11px]">
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
            <SelectTrigger className="w-[120px] h-7 text-[11px]">
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
