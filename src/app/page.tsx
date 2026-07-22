"use client";

import { useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { searchJobs as mockSearch, type Job } from "@/lib/mock-data";
import { searchJobsPublic } from "@/lib/api";

function ValueProps() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] font-mono font-medium">
            ALL THE DATA
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            7 platforms. 1,000+ companies. Every role, normalized. Updated every 30 minutes. You&apos;re not missing anything.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] font-mono font-medium">
            ACTIONABLE INTEL
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Match scores. Salary ranges. Hiring velocity. Visa sponsorship. Know exactly where you stand before you apply.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] font-mono font-medium">
            YOUR MOVE
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Target roles. Hunt companies. Save leads. Artemis watches while you sleep.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [results, setResults] = useState<Job[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    try {
      const res = await searchJobsPublic(query);
      setResults(res.data.map((p) => ({
        id: p.id,
        title: p.title,
        companyName: p.company_name ?? "",
        companySlug: p.company_slug ?? "",
        location: p.location ?? "Remote",
        source: p.source ?? "",
        description: "",
        seniority: "",
        department: "",
        skills: [],
        postedAgo: "",
        url: "",
      })));
    } catch {
      setResults(mockSearch(query).slice(0, 5));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-black/85 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-[68px] px-6">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold tracking-[0.04em] font-mono">
              artemis<span className="text-accent">.agent</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={`px-6 transition-all duration-500 ${hasSearched ? "pt-12 pb-8" : "pt-32 pb-20"}`}
        style={!hasSearched ? { backgroundImage: "repeating-linear-gradient(0deg,transparent 0px,transparent 3px,rgba(255,255,255,0.03) 3px,rgba(255,255,255,0.03) 4px)" } : undefined}>
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {!hasSearched && (
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]">
                Every job.<br />
                <span className="text-muted-foreground">Every company. Your game plan.</span>
              </h1>
              <p className="text-muted-foreground text-[15px] max-w-lg mx-auto leading-relaxed">
                Artemis aggregates every opening from 1,000+ companies, scores them against your profile, and tells you where to strike.
              </p>
            </div>
          )}
          <SearchBar onSearch={handleSearch} showFilters={hasSearched} />
        </div>
      </section>

      {/* Results */}
      {hasSearched && (
        <section className="pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-muted-foreground mb-6">
              {results.length} results
            </p>
            <div className="flex items-start gap-3 overflow-x-auto pb-4 scrollbar-none">
              {results.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>

            {results.length > 0 && (
              <div className="text-center mt-10 space-y-3">
                <Link href="/signup">
                  <Button variant="outline" size="lg" className="gap-2">
                    See all results <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">
                  Create a free account to unlock full search
                </p>
              </div>
            )}

            {results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No jobs found. Try a different search.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Before-search sections */}
      {!hasSearched && <ValueProps />}

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] text-muted-foreground">
          <span>artemis.agent</span>
          <span className="font-mono text-[11px]">The job hunting agent</span>
        </div>
      </footer>
    </div>
  );
}
