"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserNav } from "@/components/user-nav";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Bookmark } from "lucide-react";
import Link from "next/link";
import { type Job } from "@/lib/mock-data";
import {
  listJobs,
  searchJobs as apiSearch,
  apiJobToDisplay,
  listSavedJobIDs,
  saveJob,
  unsaveJob,
} from "@/lib/api";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [jobType, setJobType] = useState("all");
  const [department, setDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  const fetchJobs = useCallback(async (q: string) => {
    setLoading(true);
    const params = { limit: 50, department: department === "all" ? undefined : department, employment_type: jobType === "all" ? undefined : jobType };

    try {
      let res;
      if (!q.trim()) {
        res = await listJobs({ per_page: 50, ...params });
      } else {
        res = await apiSearch({ q, ...params });
      }
      setResults((res?.data ?? []).map(apiJobToDisplay));
      setTotalResults(res?.total ?? 0);
    } catch {
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [department, jobType]);

  useEffect(() => {
    Promise.all([
      listJobs({ per_page: 50, employment_type: jobType === "all" ? undefined : jobType, department: department === "all" ? undefined : department }),
      listSavedJobIDs().catch(() => ({ ids: [] })),
    ]).then(([jobsRes, savedRes]) => {
      setResults((jobsRes?.data ?? []).map(apiJobToDisplay));
      setTotalResults(jobsRes?.total ?? 0);
      setSavedIds(new Set(savedRes?.ids ?? []));
    }).catch(() => {}).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayed = useMemo(() => {
    let list = [...results];
    if (sortBy === "recent") {
      list.sort((a, b) => b.postedAgo.localeCompare(a.postedAgo));
    } else if (sortBy === "match") {
      list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    }
    return list;
  }, [results, sortBy]);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    await fetchJobs(q);
  }, [fetchJobs]);

  useEffect(() => { fetchJobs(query); }, [jobType, department]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSave = async (id: string) => {
    const isSaved = savedIds.has(id);
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
      <nav className="border-b border-border bg-black/85 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-[68px] px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-[15px] font-semibold tracking-[0.04em] font-mono">
              artemis<span className="text-accent">.agent</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link href="/dashboard/companies">
                <Button variant="ghost" size="sm">Companies</Button>
              </Link>
              <Link href="/dashboard/saved">
                <Button variant="ghost" size="sm">Saved</Button>
              </Link>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={jobType} onValueChange={(v) => setJobType(v ?? "all")}>
            <SelectTrigger className="w-[130px] h-7 text-[11px]">
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
          <Select value={department} onValueChange={(v) => setDepartment(v ?? "all")}>
            <SelectTrigger className="w-[130px] h-7 text-[11px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Data">Data</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? "relevance")}>
            <SelectTrigger className="w-[130px] h-7 text-[11px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="match">Match Score</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">
            {loading ? "Searching..." : `${displayed.length} of ${totalResults} results`}
          </span>
        </div>

        <div className="space-y-3">
          {!loading && displayed.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm font-medium">No jobs found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {query ? `Nothing matched "${query}". Try broader terms.` : "The pipeline is empty."}
              </p>
            </div>
          )}
          {displayed.map((job) => {
            const initials = job.companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <Card
                key={job.id}
                className="cursor-pointer transition-colors duration-150 hover:border-white/20"
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
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
                            className={`h-4 w-4 ${savedIds.has(job.id) ? "fill-accent text-accent" : ""}`}
                          />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {job.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {job.employmentType && job.employmentType !== "Full-time" && (
                          <Badge variant="secondary">
                            {job.employmentType}
                          </Badge>
                        )}
                        {job.source && (
                          <Badge variant="outline">{job.source}</Badge>
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
      </div>
    </div>
  );
}
