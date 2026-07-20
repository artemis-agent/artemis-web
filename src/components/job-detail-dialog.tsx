"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Briefcase, ExternalLink, Bookmark } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Job } from "@/lib/mock-data";

interface JobDetailDialogProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  saved?: boolean;
  onSave?: (id: string) => void;
}

export function JobDetailDialog({
  job,
  open,
  onClose,
  saved = false,
  onSave,
}: JobDetailDialogProps) {
  if (!job) return null;

  const initials = job.companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-lg">{job.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{job.companyName}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {job.employmentType ?? "Full-time"} · {job.department}
            </span>
          </div>

          {/* Match score */}
          {job.matchScore && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Match Score</span>
                <span className="font-semibold">{job.matchScore}%</span>
              </div>
              <Progress value={job.matchScore} className="h-2" />
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-semibold text-sm mb-2">About this role</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Skills */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Source + time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">{job.source}</Badge>
            <span>·</span>
            <span>{job.postedAgo}</span>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2 text-sm"
              onClick={() => window.open(job.url, "_blank")}
            >
              Apply <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => onSave?.(job.id)}
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-foreground text-foreground" : ""}`} />
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
