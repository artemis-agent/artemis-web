"use client";

import { use, useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserNav } from "@/components/user-nav";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Globe,
} from "lucide-react";
import { getJobById, type Job } from "@/lib/mock-data";
import { getJob as apiGetJob, apiJobToDisplay } from "@/lib/api";
import { addRecentView } from "@/lib/recent-views";

export default function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | undefined>(() => getJobById(id));
  const [loading, setLoading] = useState(!job);

  useEffect(() => {
    addRecentView(id);
    apiGetJob(id)
      .then((apiJob) => {
        setJob(apiJobToDisplay(apiJob));
        setLoading(false);
      })
      .catch(() => {
        if (!job) setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!job) return notFound();

  const initials = job.companyName
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
              <Link href="/dashboard/saved">
                <Button variant="ghost" size="sm">Saved</Button>
              </Link>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-6">
        <button
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/dashboard/search");
          }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
        {job.shortSummary && (
          <p className="text-sm text-muted-foreground mt-1">{job.shortSummary}</p>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-12">
          <aside className="md:w-[240px] shrink-0 space-y-6">
            <div className="space-y-5">
              <MetaBlock label="Location">
                <span className="text-sm">{job.location}</span>
              </MetaBlock>

              <Separator />

              <MetaBlock label="Employment Type">
                <span className="text-sm">
                  {job.employmentType ?? "Full-time"}
                </span>
              </MetaBlock>

              {job.salaryRange && (
                <>
                  <Separator />
                  <MetaBlock label="Salary">
                    <span className="text-sm font-medium">
                      {job.salaryRange}
                    </span>
                  </MetaBlock>
                </>
              )}

              <Separator />

              <MetaBlock label="Location Type">
                <span className="text-sm">
                  {job.locationType ?? "Remote"}
                </span>
              </MetaBlock>

              <Separator />

              <MetaBlock label="Department">
                <span className="text-sm">{job.department}</span>
              </MetaBlock>

              <Separator />

              <MetaBlock label="Seniority">
                <span className="text-sm">{job.seniority}</span>
              </MetaBlock>

              <Separator />

              <MetaBlock label="Source">
                <span className="text-sm">{job.source}</span>
              </MetaBlock>

              {job.visaSponsorship !== undefined && (
                <>
                  <Separator />
                  <MetaBlock label="Visa Sponsorship">
                    <span className={`text-sm font-medium ${job.visaSponsorship ? "text-accent" : "text-muted-foreground"}`}>
                      {job.visaSponsorship ? "Available" : "Not Available"}
                    </span>
                  </MetaBlock>
                </>
              )}

              <Separator />

              <MetaBlock label="Posted">
                <span className="text-sm">{job.postedAgo}</span>
              </MetaBlock>
            </div>

            {job.matchScore && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Match Score
                    </span>
                    <span className="text-sm font-semibold">
                      {job.matchScore}%
                    </span>
                  </div>
                  <Progress value={job.matchScore} className="h-1.5" />
                </div>
              </>
            )}

            <div className="pt-2">
              <Button
                className="w-full gap-2 text-sm"
                onClick={() => window.open(job.url, "_blank")}
              >
                Apply on {job.source}
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </aside>

          <main className="flex-1 min-w-0 space-y-8">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-secondary text-foreground text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/dashboard/companies/${job.companySlug}`}
                  className="text-sm font-medium hover:underline"
                >
                  {job.companyName}
                </Link>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {job.department}
                  </span>
                </div>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-base font-semibold">Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <DetailItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  value={job.location}
                />
                <DetailItem
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Seniority"
                  value={job.seniority}
                />
                <DetailItem
                  icon={<Clock className="h-4 w-4" />}
                  label="Type"
                  value={job.employmentType ?? "Full-time"}
                />
                <DetailItem
                  icon={<Globe className="h-4 w-4" />}
                  label="Work Style"
                  value={job.locationType ?? "Remote"}
                />
                <DetailItem
                  icon={<Building2 className="h-4 w-4" />}
                  label="Department"
                  value={job.department}
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">About the Role</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {job.description}
              </p>
            </section>

            {job.skills.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-base font-semibold">Skills & Requirements</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {job.aboutCompany && (
              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  About {job.companyName}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {job.aboutCompany}
                </p>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function MetaBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      {children}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
