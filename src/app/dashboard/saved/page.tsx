"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import Link from "next/link";
import { listSavedJobs, unsaveJob, apiJobToDisplay } from "@/lib/api";
import type { Job } from "@/lib/mock-data";

export default function SavedJobsPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSavedJobs()
      .then((res) => setSavedJobs((res?.data ?? []).map(apiJobToDisplay)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = useCallback(async (id: string) => {
    try {
      await unsaveJob(id);
      setSavedJobs((prev) => prev.filter((j) => j.id !== id));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-background">
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
              <Link href="/dashboard/search">
                <Button variant="ghost" size="sm" className="text-xs">Search</Button>
              </Link>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Saved Jobs</h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide">
            {loading ? "Loading..." : `${savedJobs.length} jobs saved`}
          </p>
        </div>

        {!loading && savedJobs.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm font-medium">Nothing saved yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t saved any jobs. Go browse — your dream role isn&apos;t going to bookmark itself.
            </p>
            <Link href="/dashboard/search">
              <Button className="text-sm">Browse Jobs</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedJobs.map((job) => (
              <div key={job.id} className="w-full">
                <JobCard
                  {...job}
                  saved
                  onSave={handleUnsave}
                  onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
