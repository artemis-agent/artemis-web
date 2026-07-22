"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserNav } from "@/components/user-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listCompanies, huntCompany, type ApiCompany } from "@/lib/api";

function formatFunding(stage?: string) {
  if (!stage) return "—";
  if (stage === "ipo" || stage === "public") return "Public";
  if (stage === "acquired") return "Acquired";
  return stage
    .replace("series_", "Series ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSize(size?: string) {
  if (!size) return "—";
  return size;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [industryFilter, setIndustryFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [fundingFilter, setFundingFilter] = useState("all");

  // Hunt
  const [huntOpen, setHuntOpen] = useState(false);
  const [huntInput, setHuntInput] = useState("");
  const [huntDone, setHuntDone] = useState(false);

  useEffect(() => {
    listCompanies(1, 200)
      .then((res) => setCompanies(res?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) => {
    if (industryFilter !== "all" && c.industry !== industryFilter) return false;
    if (sizeFilter !== "all" && c.company_size !== sizeFilter) return false;
    if (fundingFilter !== "all" && c.funding_stage !== fundingFilter) return false;
    return true;
  });

  const handleHunt = async () => {
    if (!huntInput.trim()) return;
    try {
      await huntCompany(huntInput);
      setHuntInput("");
      setHuntDone(true);
      setTimeout(() => setHuntDone(false), 4000);
    } catch {}
  };

  const industries = [...new Set(companies.map((c) => c.industry).filter(Boolean))];
  const sizes = [...new Set(companies.map((c) => c.company_size).filter(Boolean))];
  const fundingStages = [...new Set(companies.map((c) => c.funding_stage).filter(Boolean))];

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

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Companies</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {loading ? "Loading..." : `${filtered.length} companies`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={industryFilter} onValueChange={(v) => setIndustryFilter(v ?? "all")}>
            <SelectTrigger className="w-[150px] h-7 text-[11px]">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind!} value={ind!}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sizeFilter} onValueChange={(v) => setSizeFilter(v ?? "all")}>
            <SelectTrigger className="w-[140px] h-7 text-[11px]">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {sizes.map((s) => (
                <SelectItem key={s!} value={s!}>{formatSize(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fundingFilter} onValueChange={(v) => setFundingFilter(v ?? "all")}>
            <SelectTrigger className="w-[150px] h-7 text-[11px]">
              <SelectValue placeholder="Funding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {fundingStages.map((f) => (
                <SelectItem key={f!} value={f!}>{formatFunding(f)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} results
          </span>
        </div>

        {/* Table */}
        {!loading && filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-sm font-medium">No companies match these filters</p>
            <p className="text-xs text-muted-foreground">
              Try broadening your filters or hunt a new company.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-mono text-[10px] uppercase tracking-[0.08em] font-medium">
                    Company
                  </th>
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-mono text-[10px] uppercase tracking-[0.08em] font-medium">
                    Industry
                  </th>
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-mono text-[10px] uppercase tracking-[0.08em] font-medium">
                    Size
                  </th>
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-mono text-[10px] uppercase tracking-[0.08em] font-medium">
                    Funding
                  </th>
                  <th className="text-right py-2.5 px-4 text-muted-foreground font-mono text-[10px] uppercase tracking-[0.08em] font-medium">
                    Jobs
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border hover:bg-white/[0.04] cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/companies/${c.slug}`)}
                  >
                    <td className="py-2.5 px-4 font-semibold text-[13px]">{c.name}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{c.industry ?? "—"}</td>
                    <td className="py-2.5 px-4 text-muted-foreground font-mono text-[11px]">
                      {formatSize(c.company_size)}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">
                      {formatFunding(c.funding_stage)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground font-mono text-[11px]">
                      {c.job_count ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Hunt prompt */}
        <div className="text-center pt-2">
          {!huntOpen ? (
            <button
              onClick={() => setHuntOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Don&apos;t see your company? Hunt it
            </button>
          ) : huntDone ? (
            <p className="text-xs text-muted-foreground">
              Hunt submitted — it&apos;ll appear here after the next scrape.
            </p>
          ) : (
            <div className="inline-flex items-center gap-2">
              <Input
                placeholder="Company name"
                className="h-8 w-[180px] text-xs"
                value={huntInput}
                onChange={(e) => setHuntInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHunt()}
                autoFocus
              />
              <Button size="sm" disabled={!huntInput.trim()} onClick={handleHunt}>
                Hunt
              </Button>
              <button
                onClick={() => setHuntOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
