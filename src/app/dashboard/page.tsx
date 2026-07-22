"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserNav } from "@/components/user-nav";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import {
  listJobs,
  getStats,
  listSavedJobs,
  getRecommendations,
  getJob,
  apiJobToDisplay,
  type ApiStats,
  type ApiRecommendation,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { getRecentViews } from "@/lib/recent-views";
import type { Job } from "@/lib/mock-data";
import type { JobCardProps } from "@/components/job-card";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobCardProps[]>([]);
  const [recommendations, setRecommendations] = useState<ApiRecommendation[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const userId = user?.id;

    Promise.all([
      getStats().catch(() => null),
      listSavedJobs().catch(() => ({ data: [], total: 0 })),
      userId ? getRecommendations(userId, 5).catch(() => ({ recommendations: [], total: 0 })) : Promise.resolve({ recommendations: [], total: 0 }),
    ]).then(([statsRes, savedRes, recsRes]) => {
      setStats(statsRes);
      setSavedJobs((savedRes?.data ?? []).map(apiJobToDisplay));
      setRecommendations(recsRes?.recommendations ?? []);
    }).finally(() => setLoading(false));

    const recentIds = getRecentViews().slice(0, 4);
    if (recentIds.length > 0) {
      Promise.all(recentIds.map((id) => getJob(id).catch(() => null)))
        .then((jobs) => {
          setRecentJobs(
            jobs.filter((j): j is NonNullable<typeof j> => j !== null).map(apiJobToDisplay)
          );
        });
    }
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-black/85 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-[68px] px-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-[15px] font-semibold tracking-[0.04em] font-mono">
              artemis<span className="text-accent">.agent</span>
            </Link>
          </div>
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

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Onboarding banner */}
        {user && !user.onboarding_completed && (
          <div className="flex items-center justify-between bg-foreground text-background px-5 py-3 rounded-sm">
            <div>
              <p className="text-sm font-medium">Complete your profile</p>
              <p className="text-xs opacity-70">Upload your resume or fill in your details — it takes 2 minutes and unlocks better job matches.</p>
            </div>
            <Link href="/onboarding">
              <Button variant="secondary" size="sm" className="shrink-0">
                Finish Setup <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Welcome */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold">
              Welcome{user ? ` ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-xs text-muted-foreground">
              {loading ? "Brewing your dashboard..." : "Your job hunting command center"}
            </p>
          </div>
        </section>

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Top Picks For You</h2>
              <Link href="/dashboard/search" className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1">
                See All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <Card
                  key={rec.job_id}
                  className="cursor-pointer transition-colors duration-150 hover:border-border-hover"
                  onClick={() => router.push(`/dashboard/jobs/${rec.job_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <h3 className="font-semibold text-sm">{rec.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Link
                            href={`/dashboard/companies/${rec.company_slug}`}
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {rec.company_name}
                          </Link>
                          {rec.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {rec.location}
                            </span>
                          )}
                        </div>
                        {rec.matched_skills && rec.matched_skills.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {rec.matched_skills.slice(0, 5).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-[10px]">
                                {skill}
                              </Badge>
                            ))}
                            {rec.matched_skills.length > 5 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{rec.matched_skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge variant="accent" className="text-xs shrink-0">
                        {Math.round(rec.score * 100)}% match
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : !loading ? (
          <section className="text-center py-8 space-y-2">
            <p className="text-sm text-muted-foreground">No recommendations yet</p>
            <p className="text-xs text-muted-foreground">Upload your resume and we&apos;ll find jobs that actually match your skills.</p>
          </section>
        ) : null}

        {/* Search */}
        <section className="space-y-4">
          <SearchBar
            placeholder={stats ? `Search ${stats.active_jobs} jobs...` : "Search jobs..."}
            showFilters={false}
            compact
          />
          <div className="flex items-center justify-center gap-2">
            {["Engineering", "Remote", "Senior", "AI / ML", "Startup"].map((tag) => (
              <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-secondary transition-colors px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        {/* Saved Jobs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Your Saved Jobs</h2>
            {savedJobs.length > 0 && (
              <Link href="/dashboard/saved" className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1">
                View More <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          {savedJobs.length > 0 ? (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {savedJobs.slice(0, 4).map((job) => (
                <JobCard key={job.id} {...job} saved />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">Your bookmark shelf is empty. Time to window-shop some careers.</p>
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recently Viewed</h2>
            <Link href="/dashboard/search" className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1">
              Browse All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentJobs.length > 0 ? (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {recentJobs.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">You haven&apos;t viewed any jobs yet. Go explore — your next role is waiting.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
