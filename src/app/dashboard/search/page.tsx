"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserNav } from "@/components/user-nav";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Bookmark, Rocket } from "lucide-react";
import Link from "next/link";
import { type Job } from "@/lib/mock-data";
import {
  listJobs,
  searchJobs as apiSearch,
  huntCompany as apiHunt,
  apiJobToDisplay,
  listSavedJobIDs,
  saveJob,
  unsaveJob,
  type ApiJob,
} from "@/lib/api";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [huntCompanyInput, setHuntCompanyInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Load initial jobs + saved IDs from API
  useEffect(() => {
    Promise.all([
      listJobs({ per_page: 50 }),
      listSavedJobIDs().catch(() => ({ ids: [] })),
    ]).then(([jobsRes, savedRes]) => {
      setResults((jobsRes?.data ?? []).map(apiJobToDisplay));
      setTotalResults(jobsRes?.total ?? 0);
      setSavedIds(new Set(savedRes?.ids ?? []));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      try {
        const res = await listJobs({ per_page: 50 });
        setResults((res?.data ?? []).map(apiJobToDisplay));
        setTotalResults(res?.total ?? 0);
      } catch {
        setResults([]);
        setTotalResults(0);
      }
      return;
    }
    setLoading(true);
    try {
      const res = await apiSearch({ q, limit: 50 });
      setResults((res?.data ?? []).map(apiJobToDisplay));
      setTotalResults(res?.total ?? 0);
    } catch {
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleHunt = async () => {
    if (!huntCompanyInput.trim()) return;
    try {
      await apiHunt(huntCompanyInput);
      setHuntCompanyInput("");
    } catch {
      // silently fail, will show toast later
    }
  };

  const toggleSave = async (id: string) => {
    const isSaved = savedIds.has(id);
    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (isSaved) await unsaveJob(id);
      else await saveJob(id);
    } catch {
      // Revert on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">Artemis</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-xs">Dashboard</Button>
              </Link>
              <Link href="/dashboard/saved">
                <Button variant="ghost" size="sm" className="text-xs">Saved</Button>
              </Link>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Search */}
        <SearchBar
          onSearch={(q) => handleSearch(q)}
          placeholder={`Search ${totalResults} jobs across companies...`}
          compact
        />

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="match">Match Score</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">
            {loading ? "Searching..." : `${results.length} results`}
          </span>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {!loading && results.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm font-medium">No jobs found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {query ? `Nothing matched "${query}". Try broader terms — even LinkedIn couldn't find this one.` : "The pipeline is empty. Start a scrape or hunt a company to populate jobs."}
              </p>
            </div>
          )}
          {results.map((job) => {
            const initials = job.companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <Card
                key={job.id}
                className="cursor-pointer transition-all hover:shadow-sm hover:border-foreground/20"
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">{job.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {job.companyName} · {job.postedAgo}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(job.id);
                          }}
                        >
                          <Bookmark
                            className={`h-4 w-4 ${savedIds.has(job.id) ? "fill-foreground text-foreground" : ""}`}
                          />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {job.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0.5">
                            {skill}
                          </Badge>
                        ))}
                        {job.employmentType && job.employmentType !== "Full-time" && (
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                            {job.employmentType}
                          </Badge>
                        )}
                        {job.source && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                            {job.source}
                          </Badge>
                        )}
                      </div>

                      {job.matchScore && (
                        <div className="flex items-center gap-2 pt-1">
                          <Progress value={job.matchScore} className="h-1.5 flex-1 max-w-[120px]" />
                          <span className="text-xs font-medium">{job.matchScore}% match</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hunt a company */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Can&apos;t find a company?</p>
                <p className="text-xs text-muted-foreground">We&apos;ll hunt it down and scrape their jobs for you.</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Company name"
                  className="h-9 w-[160px] text-sm"
                  value={huntCompanyInput}
                  onChange={(e) => setHuntCompanyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleHunt()}
                />
                <Button size="sm" disabled={!huntCompanyInput} onClick={handleHunt}>
                  Hunt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
