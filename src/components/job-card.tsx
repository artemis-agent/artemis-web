"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Bookmark, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface JobCardProps {
  id: string;
  title: string;
  companyName: string;
  companySlug: string;
  location?: string;
  source?: string;
  seniority?: string;
  employmentType?: string;
  salaryRange?: string;
  postedAgo?: string;
  saved?: boolean;
  onSave?: (id: string) => void;
  onClick?: (id: string) => void;
}

export function JobCard({
  id,
  title,
  companyName,
  companySlug,
  location,
  source,
  seniority,
  employmentType,
  salaryRange,
  postedAgo,
  saved = false,
  onSave,
  onClick,
}: JobCardProps) {
  const router = useRouter();
  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    } else {
      router.push(`/dashboard/jobs/${id}`);
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-colors duration-150 hover:border-border-hover w-[280px] shrink-0"
      onClick={handleClick}
    >
      <CardContent className="p-4 space-y-2.5">
        <div className="flex items-start justify-between">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-secondary text-foreground text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {onSave && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onSave(id);
              }}
            >
              <Bookmark
                className={`h-3.5 w-3.5 ${saved ? "fill-accent text-accent" : ""}`}
              />
            </Button>
          )}
        </div>

        <div className="space-y-0.5">
          <h3 className="font-semibold text-[13px] leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-muted-foreground text-[11px]">{companyName}</p>
        </div>

        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
          {postedAgo && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {postedAgo}
            </span>
          )}
          {salaryRange && (
            <span className="flex items-center gap-1 text-foreground font-medium">
              <DollarSign className="h-3 w-3" />
              {salaryRange}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {employmentType && employmentType !== "Full-time" && (
            <Badge variant="secondary" className="text-[10px]">
              {employmentType}
            </Badge>
          )}
          {source && (
            <Badge variant="outline" className="text-[10px]">
              {source}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
