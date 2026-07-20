import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-sm">
        <p className="text-6xl font-semibold tracking-tight">404</p>
        <div className="space-y-2">
          <h1 className="text-lg font-medium">This page ghosted you</h1>
          <p className="text-sm text-muted-foreground">
            Much like that recruiter who said they&apos;d &quot;circle back&quot; — this page doesn&apos;t exist.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="outline" className="gap-2 text-sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Button>
          </Link>
          <Link href="/dashboard/search">
            <Button className="text-sm">Search Jobs</Button>
          </Link>
        </div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em]">
          Job Hunting. Reimagined.
        </p>
      </div>
    </div>
  );
}
