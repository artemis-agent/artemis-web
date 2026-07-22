"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserNav } from "@/components/user-nav";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Building2, Bookmark } from "lucide-react";
import {
  getCompany,
  getCompanyJobs,
  listSavedJobIDs,
  saveJob,
  unsaveJob,
  apiJobToDisplay,
  type ApiCompany,
} from "@/lib/api";
import type { Job } from "@/lib/mock-data";

export default function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<ApiCompany | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCompany(slug),
      getCompanyJobs(slug, { per_page: 100 }),
      listSavedJobIDs().catch(() => ({ ids: [] })),
    ])
      .then(([comp, jobsRes, savedRes]) => {
        setCompany(comp);
        setJobs((jobsRes?.data ?? []).map(apiJobToDisplay));
        setSavedIds(new Set(savedRes?.ids ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Company not found</p>
          <p className="text-xs text-muted-foreground">This company doesn&apos;t exist in our system.</p>
        </div>
      </div>
    );
  }

  const initials = company.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
              <Link href="/dashboard/search">
                <Button variant="ghost" size="sm">Search</Button>
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

      <div className="max-w-5xl mx-auto px-6 pt-6">
        <Link
          href="/dashboard/companies"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Companies
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-secondary text-foreground text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {company.name}
            </h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {company.ats_type.charAt(0).toUpperCase() +
                  company.ats_type.slice(1)}
              </span>
              {company.industry && (
                <span>{company.industry}</span>
              )}
              {company.company_size && (
                <span>{company.company_size}</span>
              )}
              {company.headquarters && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {company.headquarters}
                </span>
              )}
              {company.job_count !== undefined && (
                <span>{company.job_count} jobs</span>
              )}
              {company.funding_stage && (
                <span>{company.funding_stage.replace("series_", "Series ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
              )}
              {company.is_public && <span>Public</span>}
            </div>
            {company.description && (
              <p className="text-xs text-muted-foreground max-w-lg">
                {company.description}
              </p>
            )}
            {company.careers_url && (
              <div className="flex items-center gap-3">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Website →
                  </a>
                )}
                <a
                  href={company.careers_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Careers page →
                </a>
                <a
                  href={`https://www.levels.fyi/companies/${company.slug}/salaries`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Salary data (levels.fyi) →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Open Positions ({jobs.length})
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-medium">No open positions</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Either they&apos;re fully staffed or our scraper hasn&apos;t caught up yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className="cursor-pointer transition-colors duration-150 hover:border-white/20"
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-semibold text-sm">{job.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        )}
                        {job.employmentType && job.employmentType !== "Full-time" && (
                          <Badge variant="secondary">
                            {job.employmentType}
                          </Badge>
                        )}
                        {job.department && (
                          <Badge variant="secondary">
                            {job.department}
                          </Badge>
                        )}
                        <span>{job.postedAgo}</span>
                      </div>
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
