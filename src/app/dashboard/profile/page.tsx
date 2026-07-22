"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserNav } from "@/components/user-nav";
import { Upload, ShieldCheck, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  completeOnboarding,
  uploadResume,
  updatePreferences,
  setSecurityQuestion,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { SECURITY_QUESTIONS } from "@/app/forgot-password/page";
import { TagInput } from "@/components/tag-input";
import { MASTER_SKILLS, MASTER_ROLES } from "@/lib/master-lists";

const SENIORITY_OPTIONS = [
  "Intern",
  "Junior",
  "Mid",
  "Senior",
  "Staff",
  "Principal",
  "Director",
  "VP",
  "C-Level",
];

interface Experience {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description?: string;
  technologies?: string[];
}

interface Education {
  degree: string;
  institution: string;
  field?: string;
  year?: number | string;
  gpa?: string;
}

interface Certification {
  name: string;
  issuer?: string;
  year?: number | string;
}

interface Project {
  name: string;
  description?: string;
  url?: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const userId = user?.id ?? "";
  const [tab, setTab] = useState<"profile" | "career" | "notifications" | "security">("profile");

  // Read-only identity fields
  const name = user?.name ?? "";
  const email = user?.email ?? "";

  // Editable basic info
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState("");
  const [seniority, setSeniority] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [desiredRoles, setDesiredRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  // Editable rich sections
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Security tab
  const [secQuestion, setSecQuestion] = useState("");
  const [secAnswer, setSecAnswer] = useState("");
  const [secSaving, setSecSaving] = useState(false);
  const [secSaved, setSecSaved] = useState(false);
  const [secError, setSecError] = useState("");

  // Notifications tab
  const [notifEmail, setNotifEmail] = useState("");
  const [notifs, setNotifs] = useState({
    enabled: true,
    newMatches: true,
    savedUpdates: false,
    weeklyDigest: true,
  });

  // Resume upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Hydrate from user on load
  useEffect(() => {
    if (!user) return;
    setHeadline(user.headline ?? "");
    setSummary(user.summary ?? "");
    setLocation(user.location ?? "");
    setSeniority(user.seniority_level ?? "");
    setYearsExp(String(user.years_experience ?? ""));
    setDesiredRoles(user.desired_roles ?? []);

    const prefs = (user.preferences ?? {}) as Record<string, unknown>;
    if (Array.isArray(prefs.skills)) setSkills(prefs.skills as string[]);
    if (prefs.notifications) {
      const n = prefs.notifications as Record<string, unknown>;
      setNotifs({
        enabled: (n.enabled as boolean) ?? true,
        newMatches: (n.new_matches as boolean) ?? true,
        savedUpdates: (n.saved_updates as boolean) ?? false,
        weeklyDigest: (n.weekly_digest as boolean) ?? true,
      });
      if (n.email) setNotifEmail(n.email as string);
    }

    const profile = (user.profile ?? {}) as Record<string, unknown>;
    if (Array.isArray(profile.experience)) setExperience(profile.experience as Experience[]);
    if (Array.isArray(profile.education)) setEducation(profile.education as Education[]);
    if (Array.isArray(profile.certifications)) setCertifications(profile.certifications as Certification[]);
    if (Array.isArray(profile.projects)) setProjects(profile.projects as Project[]);
    if (Array.isArray(profile.languages)) setLanguages(profile.languages as string[]);
  }, [user]);

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await completeOnboarding({
        headline,
        summary,
        seniority_level: seniority,
        years_experience: parseInt(yearsExp, 10) || 0,
        location,
        desired_roles: desiredRoles,
        skills,
        experience: JSON.stringify(experience) as unknown as string,
        education: JSON.stringify(education) as unknown as string,
        certifications: JSON.stringify(certifications) as unknown as string,
        projects: JSON.stringify(projects) as unknown as string,
        languages,
      });

      // Also persist preferences (notifications + skills mirror)
      await updatePreferences(userId, {
        skills,
        notifications: {
          enabled: notifs.enabled,
          email: notifEmail || email,
          new_matches: notifs.newMatches,
          saved_updates: notifs.savedUpdates,
          weekly_digest: notifs.weeklyDigest,
        },
      });

      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
    setSaving(false);
  };

  const handleResumeUpload = async (file: File) => {
    if (!userId) return;
    setResumeUploading(true);
    try {
      await uploadResume(userId, file);
      await refreshUser();
    } catch {}
    setResumeUploading(false);
  };

  // Experience helpers
  const addExperience = () =>
    setExperience([...experience, { title: "", company: "", start_date: "", end_date: "" }]);
  const updateExperience = (i: number, patch: Partial<Experience>) =>
    setExperience(experience.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const removeExperience = (i: number) =>
    setExperience(experience.filter((_, idx) => idx !== i));

  // Education helpers
  const addEducation = () =>
    setEducation([...education, { degree: "", institution: "" }]);
  const updateEducation = (i: number, patch: Partial<Education>) =>
    setEducation(education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const removeEducation = (i: number) =>
    setEducation(education.filter((_, idx) => idx !== i));

  // Certification helpers
  const addCert = () => setCertifications([...certifications, { name: "" }]);
  const updateCert = (i: number, patch: Partial<Certification>) =>
    setCertifications(certifications.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const removeCert = (i: number) =>
    setCertifications(certifications.filter((_, idx) => idx !== i));

  // Project helpers
  const addProject = () => setProjects([...projects, { name: "" }]);
  const updateProject = (i: number, patch: Partial<Project>) =>
    setProjects(projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const removeProject = (i: number) =>
    setProjects(projects.filter((_, idx) => idx !== i));

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
                <Button variant="ghost" size="sm">
                  Search
                </Button>
              </Link>
              <Link href="/dashboard/companies">
                <Button variant="ghost" size="sm">
                  Companies
                </Button>
              </Link>
              <Link href="/dashboard/saved">
                <Button variant="ghost" size="sm">
                  Saved
                </Button>
              </Link>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="text-xs text-muted-foreground tracking-wide mt-1">
            Update your profile to improve job matches and recommendations
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) =>
            setTab(v as "profile" | "career" | "notifications" | "security")
          }
        >
          <TabsList>
            <TabsTrigger value="profile" className="text-xs">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="career" className="text-xs">
              Career & Skills
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs">
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">
              Notifications
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* ── BASIC INFO ────────────────────────────────────────── */}
        {tab === "profile" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Identity
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Name and email cannot be changed here. Contact support if you
                  need to update them.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ReadOnlyField label="Name" value={name} />
                  <ReadOnlyField label="Email" value={email} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  About You
                </h2>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Headline
                  </label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer at Stripe"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Summary
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="A short paragraph about your experience, interests, and what you're looking for"
                    className="w-full min-h-25 text-sm rounded-md border border-border bg-transparent px-3 py-2 resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="h-9 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Resume
                </h2>
                <div className="border border-dashed border-border rounded-md p-8 text-center space-y-3">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Upload a PDF to update your skills and job matches
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleResumeUpload(f);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={resumeUploading}
                  >
                    {resumeUploading ? "Uploading..." : "Upload Resume"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── CAREER & SKILLS ───────────────────────────────────── */}
        {tab === "career" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Career Level
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Seniority
                    </label>
                    <Select
                      value={seniority}
                      onValueChange={(v: string | null) => setSeniority(v ?? "")}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {SENIORITY_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s.toLowerCase()}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={yearsExp}
                      onChange={(e) => setYearsExp(e.target.value)}
                      placeholder="Years"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <TagInput
                  label="Desired Roles"
                  placeholder="e.g. Senior Backend Engineer"
                  selected={desiredRoles}
                  onChange={setDesiredRoles}
                  suggestions={MASTER_ROLES}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <TagInput
                  label="Skills"
                  placeholder="e.g. Python, Kubernetes, React"
                  selected={skills}
                  onChange={setSkills}
                  suggestions={MASTER_SKILLS}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <TagInput
                  label="Languages"
                  placeholder="e.g. English, Spanish"
                  selected={languages}
                  onChange={setLanguages}
                  suggestions={["English", "Spanish", "French", "German", "Mandarin", "Hindi", "Japanese", "Portuguese", "Italian", "Russian", "Arabic"]}
                />
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Experience
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={addExperience}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {experience.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No experience added yet
                  </p>
                )}
                {experience.map((exp, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-border p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                        Position #{i + 1}
                      </div>
                      <button
                        onClick={() => removeExperience(i)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        value={exp.title}
                        onChange={(e) =>
                          updateExperience(i, { title: e.target.value })
                        }
                        placeholder="Title"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(i, { company: e.target.value })
                        }
                        placeholder="Company"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={exp.start_date}
                        onChange={(e) =>
                          updateExperience(i, { start_date: e.target.value })
                        }
                        placeholder="Start (e.g. 2021)"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={exp.end_date}
                        onChange={(e) =>
                          updateExperience(i, { end_date: e.target.value })
                        }
                        placeholder="End (or 'Present')"
                        className="h-9 text-sm"
                      />
                    </div>
                    <textarea
                      value={exp.description ?? ""}
                      onChange={(e) =>
                        updateExperience(i, { description: e.target.value })
                      }
                      placeholder="What you did, impact, technologies used..."
                      className="w-full min-h-15 text-sm rounded-md border border-border bg-transparent px-3 py-2 resize-y"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Education
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={addEducation}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {education.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No education added yet
                  </p>
                )}
                {education.map((ed, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-border p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                        Degree #{i + 1}
                      </div>
                      <button
                        onClick={() => removeEducation(i)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        value={ed.degree}
                        onChange={(e) =>
                          updateEducation(i, { degree: e.target.value })
                        }
                        placeholder="Degree (e.g. BS)"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={ed.institution}
                        onChange={(e) =>
                          updateEducation(i, { institution: e.target.value })
                        }
                        placeholder="Institution"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={ed.field ?? ""}
                        onChange={(e) =>
                          updateEducation(i, { field: e.target.value })
                        }
                        placeholder="Field of Study"
                        className="h-9 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={String(ed.year ?? "")}
                          onChange={(e) =>
                            updateEducation(i, { year: e.target.value })
                          }
                          placeholder="Year"
                          className="h-9 text-sm"
                        />
                        <Input
                          value={ed.gpa ?? ""}
                          onChange={(e) =>
                            updateEducation(i, { gpa: e.target.value })
                          }
                          placeholder="GPA"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Certifications
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={addCert}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {certifications.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No certifications added yet
                  </p>
                )}
                {certifications.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 items-center"
                  >
                    <Input
                      value={c.name}
                      onChange={(e) => updateCert(i, { name: e.target.value })}
                      placeholder="Certification name"
                      className="h-9 text-sm"
                    />
                    <Input
                      value={c.issuer ?? ""}
                      onChange={(e) => updateCert(i, { issuer: e.target.value })}
                      placeholder="Issuer"
                      className="h-9 text-sm"
                    />
                    <Input
                      value={String(c.year ?? "")}
                      onChange={(e) => updateCert(i, { year: e.target.value })}
                      placeholder="Year"
                      className="h-9 text-sm"
                    />
                    <button
                      onClick={() => removeCert(i)}
                      className="text-muted-foreground hover:text-destructive p-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Projects
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={addProject}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {projects.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No projects added yet
                  </p>
                )}
                {projects.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-border p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                        Project #{i + 1}
                      </div>
                      <button
                        onClick={() => removeProject(i)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Input
                      value={p.name}
                      onChange={(e) =>
                        updateProject(i, { name: e.target.value })
                      }
                      placeholder="Project name"
                      className="h-9 text-sm"
                    />
                    <Input
                      value={p.url ?? ""}
                      onChange={(e) =>
                        updateProject(i, { url: e.target.value })
                      }
                      placeholder="URL (optional)"
                      className="h-9 text-sm"
                    />
                    <textarea
                      value={p.description ?? ""}
                      onChange={(e) =>
                        updateProject(i, { description: e.target.value })
                      }
                      placeholder="Description"
                      className="w-full min-h-15 text-sm rounded-md border border-border bg-transparent px-3 py-2 resize-y"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── NOTIFICATIONS ─────────────────────────────────────── */}
        {tab === "notifications" && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive updates about jobs and matches
                  </p>
                </div>
                <Switch
                  checked={notifs.enabled}
                  onCheckedChange={(v) => setNotifs({ ...notifs, enabled: v })}
                />
              </div>
              {notifs.enabled && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Notification Email
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Leave blank to use your registration email
                    </p>
                    <Input
                      value={notifEmail}
                      onChange={(e) => setNotifEmail(e.target.value)}
                      placeholder={email}
                      className="h-9 text-sm max-w-sm"
                    />
                  </div>
                  <Separator />
                  <NotifRow
                    label="New Job Matches"
                    description="Get notified when new jobs match your skills"
                    checked={notifs.newMatches}
                    onChange={(v) => setNotifs({ ...notifs, newMatches: v })}
                  />
                  <NotifRow
                    label="Saved Job Updates"
                    description="Alerts when saved jobs are updated or removed"
                    checked={notifs.savedUpdates}
                    onChange={(v) => setNotifs({ ...notifs, savedUpdates: v })}
                  />
                  <NotifRow
                    label="Weekly Digest"
                    description="A weekly summary of top jobs matching your profile"
                    checked={notifs.weeklyDigest}
                    onChange={(v) => setNotifs({ ...notifs, weeklyDigest: v })}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── SECURITY ───────────────────────────────────────────── */}
        {tab === "security" && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Security Question
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Set a security question to enable password recovery. Your answer
                is case-insensitive and stored securely.
              </p>
              {user?.security_question_set && (
                <div className="rounded-md border border-border bg-muted/50 p-3">
                  <p className="text-[11px] text-muted-foreground">
                    Current question:
                  </p>
                  <p className="text-sm font-medium">{user.security_question}</p>
                </div>
              )}
              <Separator />
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Security Question
                  </label>
                  <Select
                    value={secQuestion}
                    onValueChange={(v: string | null) =>
                      setSecQuestion(v ?? "")
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Choose a question..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SECURITY_QUESTIONS.map((q) => (
                        <SelectItem key={q} value={q} className="text-sm">
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Your Answer
                  </label>
                  <Input
                    type="text"
                    value={secAnswer}
                    onChange={(e) => setSecAnswer(e.target.value)}
                    placeholder="Your answer"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              {secError && (
                <p className="text-xs text-destructive">{secError}</p>
              )}
              {secSaved && (
                <p className="text-xs text-muted-foreground">
                  Security question updated
                </p>
              )}
              <Button
                size="sm"
                className="text-xs"
                disabled={secSaving || !secQuestion || !secAnswer}
                onClick={async () => {
                  setSecSaving(true);
                  setSecError("");
                  setSecSaved(false);
                  try {
                    await setSecurityQuestion(secQuestion, secAnswer);
                    await refreshUser();
                    setSecAnswer("");
                    setSecSaved(true);
                    setTimeout(() => setSecSaved(false), 3000);
                  } catch (err) {
                    setSecError(
                      err instanceof Error
                        ? err.message
                        : "Failed to set security question"
                    );
                  }
                  setSecSaving(false);
                }}
              >
                {secSaving
                  ? "Saving..."
                  : user?.security_question_set
                  ? "Update Security Question"
                  : "Set Security Question"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sticky save bar (hidden on security tab — has its own save) */}
        {tab !== "security" && (
          <div className="sticky bottom-4 z-40">
            <div className="bg-background border border-border rounded-lg shadow-sm p-3 flex items-center justify-between">
              <div className="text-xs">
                {error && <span className="text-destructive">{error}</span>}
                {saved && (
                  <span className="text-muted-foreground">
                    Saved — recommendations refreshing in the background
                  </span>
                )}
              </div>
              <Button
                className="text-sm"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input value={value} disabled className="h-9 text-sm opacity-60" />
    </div>
  );
}

function NotifRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// Ensure ApiUser type is referenced (avoids unused-import warning when the
// type is only used implicitly via useAuth's User return).
