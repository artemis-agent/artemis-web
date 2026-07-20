"use client";

import { useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { searchJobs as mockSearch, type Job } from "@/lib/mock-data";
import { searchJobsPublic } from "@/lib/api";

const ATS_PLATFORMS = [
  "Greenhouse", "Lever", "Ashby", "Workday",
  "SmartRecruiters", "iCIMS", "Eightfold",
];

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
      <nav className="bg-background sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">Artemis</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-xs tracking-wide h-9 px-4">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button className="text-xs tracking-wide h-9 px-4">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={`px-6 transition-all duration-500 ${hasSearched ? "pt-12 pb-8" : "pt-32 pb-24"}`}>
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {!hasSearched && (
            <>
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
                  Find better work.
                </h1>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-muted-foreground">
                  Build your future.
                </h1>
              </div>
              <p className="text-muted-foreground text-sm tracking-wide max-w-md mx-auto">
                Real-time jobs from 1,000+ companies across 7 ATS platforms. Scraped, verified, updated every 30 minutes.
              </p>
            </>
          )}
          <SearchBar onSearch={handleSearch} showFilters={hasSearched} />
        </div>
      </section>

      {/* Results — only after search */}
      {hasSearched && (
        <section className="pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-muted-foreground mb-6 tracking-wide">
              {results.length} results
            </p>
            <div className="flex items-start gap-4 overflow-x-auto pb-4 scrollbar-none">
              {results.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>

            {results.length > 0 && (
              <div className="text-center mt-10 space-y-3">
                <Link href="/signup">
                  <Button variant="outline" size="lg" className="gap-2 tracking-wide text-sm">
                    See all results <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground tracking-wide mt-2">
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

      {/* Bottom — ATS platforms */}
      {!hasSearched && (
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-10">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] font-medium">
              Supported ATS platforms
            </p>
            <div className="flex items-center justify-center gap-x-8 gap-y-3 flex-wrap">
              {ATS_PLATFORMS.map((name) => (
                <span key={name} className="text-xs text-muted-foreground tracking-wide">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] text-muted-foreground tracking-wide">
          <span>© 2025 Artemis</span>
          <span className="uppercase tracking-[0.15em]">Job Hunting. Reimagined.</span>
        </div>
      </footer>
    </div>
  );
}
