"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload, ArrowRight, ArrowLeft, FileText, PenLine, Plus, X, Check } from "lucide-react";
import { completeOnboarding, uploadResume, getResume, getParseProgress } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { TagInput } from "@/components/tag-input";
import { MASTER_SKILLS, MASTER_ROLES } from "@/lib/master-lists";

const SENIORITY_OPTIONS = ["Intern", "Junior", "Mid", "Senior", "Staff", "Principal", "Director", "VP", "C-Level"];

type Mode = "choose" | "resume" | "manual" | "review";

interface ExperienceEntry {
  title: string; company: string; location: string;
  start_date: string; end_date: string; is_current: boolean; description: string;
}
interface EducationEntry {
  degree: string; institution: string; field: string; year: string; gpa: string;
}
interface ProjectEntry {
  name: string; description: string; technologies: string; url: string;
}
interface CertEntry {
  name: string; issuer: string; year: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [mode, setMode] = useState<Mode>("choose");
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [parseStage, setParseStage] = useState("Waiting...");
  const [parsePct, setParsePct] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  // Profile fields
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState("");
  const [seniority, setSeniority] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [desiredRoles, setDesiredRoles] = useState<string[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [certifications, setCertifications] = useState<CertEntry[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.replace("/signup");
  }, [authLoading, user, router]);

  // Refresh user and auto-fill on mount
  useEffect(() => {
    refreshUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.headline) setHeadline(user.headline);
    if (user.summary) setSummary(user.summary ?? "");
    if (user.seniority_level) setSeniority(user.seniority_level);
    if (user.years_experience) setYearsExp(String(user.years_experience));
    if (user.location) setLocation(user.location);
    if (user.desired_roles?.length) setDesiredRoles(user.desired_roles);
    const prefs = user.preferences as Record<string, unknown> | undefined;
    if (prefs?.skills) setSkills(prefs.skills as string[]);
    const p = user.profile as Record<string, unknown> | undefined;
    if (p?.experience) setExperience(p.experience as ExperienceEntry[]);
    if (p?.education) setEducation(p.education as EducationEntry[]);
    if (p?.projects) setProjects(p.projects as ProjectEntry[]);
    if (p?.certifications) setCertifications(p.certifications as CertEntry[]);
    if (p?.languages) setLanguages(p.languages as string[]);
  }, [user]);

  // Resume upload handler
  const handleResumeUpload = async (file: File) => {
    if (!user?.id) return;
    setParsing(true);
    setError("");
    try {
      const uploadResult = await uploadResume(user.id, file);
      setResumeFile(file.name);
      let attempts = 0;
      const poll = async (): Promise<void> => {
        attempts++;
        if (attempts > 60) {
          setError("Parsing took too long. You can edit manually.");
          setParsing(false);
          setMode("manual");
          setStep(0);
          return;
        }
        try {
          const progress = await getParseProgress(user.id, uploadResult.resume_id);
          setParseStage(progress.stage);
          setParsePct(progress.percent);
        } catch {}
        try {
          const resume = await getResume(user.id);
          if (resume.parsed_data && Object.keys(resume.parsed_data).length > 0) {
            autoFillFromParsed(resume.parsed_data as Record<string, unknown>);
            await refreshUser();
            setParsing(false);
            setMode("review");
            return;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 1500));
        return poll();
      };
      await poll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setParsing(false);
    }
  };

  const autoFillFromParsed = (data: Record<string, unknown>) => {
    if (data.headline) setHeadline(data.headline as string);
    if (data.summary) setSummary(data.summary as string);
    if (data.seniority_level) setSeniority(data.seniority_level as string);
    if (data.years_of_experience) setYearsExp(String(data.years_of_experience));
    if (data.preferred_locations) setLocation((data.preferred_locations as string[])[0] ?? "");
    if (data.skills) {
      const s = data.skills as Array<{ name: string } | string>;
      setSkills(s.map((x) => (typeof x === "string" ? x : x.name)));
    }
    if (data.desired_roles) setDesiredRoles(data.desired_roles as string[]);
    if (data.experience) setExperience(data.experience as ExperienceEntry[]);
    if (data.education) setEducation(data.education as EducationEntry[]);
    if (data.projects) setProjects(data.projects as ProjectEntry[]);
    if (data.certifications) setCertifications(data.certifications as CertEntry[]);
    if (data.languages) setLanguages(data.languages as string[]);
  };

  const handleComplete = async () => {
    setSaving(true);
    setError("");
    try {
      await completeOnboarding({
        headline, summary, seniority_level: seniority,
        years_experience: parseInt(yearsExp) || 0,
        location, desired_roles: desiredRoles, skills,
        experience: experience.length ? JSON.stringify(experience) : undefined,
        education: education.length ? JSON.stringify(education) : undefined,
        certifications: certifications.length ? JSON.stringify(certifications) : undefined,
        projects: projects.length ? JSON.stringify(projects) : undefined,
        languages,
      });
      await refreshUser();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ── CHOOSE MODE ──
  if (mode === "choose") {
    return (
      <Shell title="Set up your profile" subtitle="Choose how you want to get started">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="cursor-pointer transition-all hover:shadow-sm hover:border-foreground/20" onClick={() => setMode("resume")}>
            <CardContent className="p-6 text-center space-y-3">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="text-sm font-semibold">Upload Resume</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">AI extracts your experience, education, skills &amp; projects. Review and edit before saving.</p>
              <Badge variant="secondary" className="text-[10px]">Recommended</Badge>
            </CardContent>
          </Card>
          <Card className="cursor-pointer transition-all hover:shadow-sm hover:border-foreground/20" onClick={() => { setMode("manual"); setStep(0); }}>
            <CardContent className="p-6 text-center space-y-3">
              <PenLine className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="text-sm font-semibold">Fill Manually</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Enter your details step by step. Takes about 3-5 minutes.</p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center">
          <button onClick={handleComplete} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skip for now — I&apos;ll set this up later →
          </button>
        </div>
      </Shell>
    );
  }

  // ── RESUME UPLOAD ──
  if (mode === "resume") {
    return (
      <Shell title="Upload your resume" subtitle={parsing ? parseStage : "AI will extract everything for you to review"}>
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            {parsing ? (
              <div className="space-y-4 py-4">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-foreground rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.max(parsePct, 5)}%` }} />
                </div>
                <p className="text-sm font-medium">{parseStage}</p>
                <p className="text-[11px] text-muted-foreground">{parsePct}% complete</p>
                {resumeFile && <p className="text-xs text-muted-foreground">{resumeFile}</p>}
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Drop your resume here</p>
                <p className="text-xs text-muted-foreground">PDF only, max 10MB</p>
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f); }} />
                <Button variant="outline" className="text-sm" onClick={() => fileInputRef.current?.click()}>Choose PDF</Button>
              </>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => setMode("choose")} className="gap-1 text-xs"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
          <Button variant="ghost" size="sm" onClick={() => { setMode("manual"); setStep(0); }} className="text-xs">Fill manually instead</Button>
        </div>
      </Shell>
    );
  }

  // ── MANUAL STEPS ──
  const manualSteps = ["Basic Info", "Experience", "Education", "Skills & Roles", "Projects & Certs"];

  if (mode === "manual") {
    return (
      <Shell title={manualSteps[step]} subtitle={`Step ${step + 1} of ${manualSteps.length}`}>
        <ProgressDots current={step} total={manualSteps.length} />
        {error && <p className="text-xs text-destructive text-center">{error}</p>}

        {step === 0 && (
          <Card><CardContent className="p-6 space-y-4">
            <Field label="Headline"><Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Senior Backend Engineer | Go, Python" className="h-10" /></Field>
            <Field label="Summary"><textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="2-3 sentences about what you do" className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Location"><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="h-10" /></Field>
              <Field label="Years of experience"><Input type="number" min="0" max="50" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} placeholder="e.g. 5" className="h-10" /></Field>
            </div>
            <Field label="Seniority">
              <Select value={seniority} onValueChange={(v: string | null) => setSeniority(v ?? "")}>
                <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>{SENIORITY_OPTIONS.map((s) => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </CardContent></Card>
        )}

        {step === 1 && (
          <Card><CardContent className="p-6 space-y-4">
            {experience.map((exp, i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
                <button onClick={() => setExperience(experience.filter((_, j) => j !== i))} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Title"><Input value={exp.title} onChange={(e) => { const n = [...experience]; n[i] = { ...exp, title: e.target.value }; setExperience(n); }} className="h-9 text-xs" /></Field>
                  <Field label="Company"><Input value={exp.company} onChange={(e) => { const n = [...experience]; n[i] = { ...exp, company: e.target.value }; setExperience(n); }} className="h-9 text-xs" /></Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Start"><Input value={exp.start_date} onChange={(e) => { const n = [...experience]; n[i] = { ...exp, start_date: e.target.value }; setExperience(n); }} placeholder="2022-01" className="h-9 text-xs" /></Field>
                  <Field label="End"><Input value={exp.end_date} onChange={(e) => { const n = [...experience]; n[i] = { ...exp, end_date: e.target.value }; setExperience(n); }} placeholder="Present" className="h-9 text-xs" /></Field>
                  <Field label="Location"><Input value={exp.location} onChange={(e) => { const n = [...experience]; n[i] = { ...exp, location: e.target.value }; setExperience(n); }} className="h-9 text-xs" /></Field>
                </div>
                <Field label="Description"><textarea value={exp.description} onChange={(e) => { const n = [...experience]; n[i] = { ...exp, description: e.target.value }; setExperience(n); }} className="w-full min-h-[50px] rounded-lg border border-input bg-transparent px-3 py-2 text-xs outline-none" /></Field>
              </div>
            ))}
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setExperience([...experience, { title: "", company: "", location: "", start_date: "", end_date: "", is_current: false, description: "" }])}><Plus className="h-3 w-3" /> Add Experience</Button>
          </CardContent></Card>
        )}

        {step === 2 && (
          <Card><CardContent className="p-6 space-y-4">
            {education.map((edu, i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
                <button onClick={() => setEducation(education.filter((_, j) => j !== i))} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Degree"><Input value={edu.degree} onChange={(e) => { const n = [...education]; n[i] = { ...edu, degree: e.target.value }; setEducation(n); }} placeholder="B.S. Computer Science" className="h-9 text-xs" /></Field>
                  <Field label="Institution"><Input value={edu.institution} onChange={(e) => { const n = [...education]; n[i] = { ...edu, institution: e.target.value }; setEducation(n); }} className="h-9 text-xs" /></Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Field/Minor"><Input value={edu.field} onChange={(e) => { const n = [...education]; n[i] = { ...edu, field: e.target.value }; setEducation(n); }} className="h-9 text-xs" /></Field>
                  <Field label="Year"><Input value={edu.year} onChange={(e) => { const n = [...education]; n[i] = { ...edu, year: e.target.value }; setEducation(n); }} placeholder="2022" className="h-9 text-xs" /></Field>
                  <Field label="GPA"><Input value={edu.gpa} onChange={(e) => { const n = [...education]; n[i] = { ...edu, gpa: e.target.value }; setEducation(n); }} placeholder="3.8/4.0" className="h-9 text-xs" /></Field>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setEducation([...education, { degree: "", institution: "", field: "", year: "", gpa: "" }])}><Plus className="h-3 w-3" /> Add Education</Button>
          </CardContent></Card>
        )}

        {step === 3 && (
          <Card><CardContent className="p-6 space-y-5">
            <TagInput label="Your skills" placeholder="Add another skill..." selected={skills} onChange={setSkills} suggestions={MASTER_SKILLS} />
            <TagInput label="Desired roles" placeholder="Add another role..." selected={desiredRoles} onChange={setDesiredRoles} suggestions={MASTER_ROLES} />
          </CardContent></Card>
        )}

        {step === 4 && (
          <Card><CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projects</h3>
            {projects.map((proj, i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
                <button onClick={() => setProjects(projects.filter((_, j) => j !== i))} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name"><Input value={proj.name} onChange={(e) => { const n = [...projects]; n[i] = { ...proj, name: e.target.value }; setProjects(n); }} className="h-9 text-xs" /></Field>
                  <Field label="URL"><Input value={proj.url} onChange={(e) => { const n = [...projects]; n[i] = { ...proj, url: e.target.value }; setProjects(n); }} placeholder="https://..." className="h-9 text-xs" /></Field>
                </div>
                <Field label="Description"><Input value={proj.description} onChange={(e) => { const n = [...projects]; n[i] = { ...proj, description: e.target.value }; setProjects(n); }} className="h-9 text-xs" /></Field>
                <Field label="Technologies"><Input value={proj.technologies} onChange={(e) => { const n = [...projects]; n[i] = { ...proj, technologies: e.target.value }; setProjects(n); }} placeholder="React, Node.js, PostgreSQL" className="h-9 text-xs" /></Field>
              </div>
            ))}
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setProjects([...projects, { name: "", description: "", technologies: "", url: "" }])}><Plus className="h-3 w-3" /> Add Project</Button>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4">Certifications</h3>
            {certifications.map((cert, i) => (
              <div key={i} className="border border-border rounded-lg p-3 relative">
                <button onClick={() => setCertifications(certifications.filter((_, j) => j !== i))} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Name"><Input value={cert.name} onChange={(e) => { const n = [...certifications]; n[i] = { ...cert, name: e.target.value }; setCertifications(n); }} className="h-9 text-xs" /></Field>
                  <Field label="Issuer"><Input value={cert.issuer} onChange={(e) => { const n = [...certifications]; n[i] = { ...cert, issuer: e.target.value }; setCertifications(n); }} className="h-9 text-xs" /></Field>
                  <Field label="Year"><Input value={cert.year} onChange={(e) => { const n = [...certifications]; n[i] = { ...cert, year: e.target.value }; setCertifications(n); }} className="h-9 text-xs" /></Field>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setCertifications([...certifications, { name: "", issuer: "", year: "" }])}><Plus className="h-3 w-3" /> Add Certification</Button>
          </CardContent></Card>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => step > 0 ? setStep(step - 1) : setMode("choose")} className="gap-1 text-xs"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
          {step < manualSteps.length - 1 ? (
            <Button size="sm" onClick={() => setStep(step + 1)} className="gap-1 text-xs">Next <ArrowRight className="h-3.5 w-3.5" /></Button>
          ) : (
            <Button size="sm" onClick={() => setMode("review")} className="gap-1 text-xs">Review <ArrowRight className="h-3.5 w-3.5" /></Button>
          )}
        </div>
      </Shell>
    );
  }

  // ── AI REVIEW ──
  if (mode === "review") {
    return (
      <Shell title="Review your profile" subtitle="Make sure everything looks good before saving">
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        <Card><CardContent className="p-6 space-y-4">
          <ReviewSection title="Personal Info">
            <ReviewRow label="Headline" value={headline} />
            <ReviewRow label="Location" value={location} />
            <ReviewRow label="Seniority" value={seniority} />
            <ReviewRow label="Experience" value={yearsExp ? `${yearsExp} years` : "—"} />
          </ReviewSection>

          {experience.length > 0 && (
            <ReviewSection title="Experience">
              {experience.map((exp, i) => (
                <div key={i} className="text-xs space-y-0.5">
                  <p className="font-medium">{exp.title} at {exp.company}</p>
                  <p className="text-muted-foreground">{exp.start_date} — {exp.end_date || "Present"} · {exp.location}</p>
                </div>
              ))}
            </ReviewSection>
          )}

          {education.length > 0 && (
            <ReviewSection title="Education">
              {education.map((edu, i) => (
                <div key={i} className="text-xs">
                  <p className="font-medium">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                  <p className="text-muted-foreground">{edu.institution} · {edu.year}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</p>
                </div>
              ))}
            </ReviewSection>
          )}

          <ReviewSection title="Skills">
            <div className="flex flex-wrap gap-1">{skills.map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}</div>
          </ReviewSection>

          {desiredRoles.length > 0 && (
            <ReviewSection title="Desired Roles">
              <p className="text-xs">{desiredRoles.join(", ")}</p>
            </ReviewSection>
          )}

          {projects.length > 0 && (
            <ReviewSection title="Projects">
              {projects.map((proj, i) => (
                <div key={i} className="text-xs">
                  <p className="font-medium">{proj.name}</p>
                  <p className="text-muted-foreground">{proj.description}</p>
                </div>
              ))}
            </ReviewSection>
          )}

          {certifications.length > 0 && (
            <ReviewSection title="Certifications">
              {certifications.map((cert, i) => (
                <p key={i} className="text-xs">{cert.name} — {cert.issuer} ({cert.year})</p>
              ))}
            </ReviewSection>
          )}
        </CardContent></Card>

        <div className="flex items-center gap-3">
          <button onClick={() => setConfirmed(!confirmed)} className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${confirmed ? "bg-foreground border-foreground" : "border-border"}`}>
            {confirmed && <Check className="h-3 w-3 text-background" />}
          </button>
          <p className="text-xs text-muted-foreground">I confirm these details are accurate</p>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => { setMode("manual"); setStep(0); }} className="gap-1 text-xs"><ArrowLeft className="h-3.5 w-3.5" /> Edit Details</Button>
          <Button size="sm" onClick={handleComplete} disabled={saving || !confirmed} className="text-xs px-6">
            {saving ? "Saving..." : "Complete Profile"}
          </Button>
        </div>
      </Shell>
    );
  }

  return null;
}

// ── Helpers ──

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[15px] font-semibold tracking-[0.04em] font-mono">
            artemis<span className="text-accent">.agent</span>
          </span>
          <h1 className="text-xl font-semibold mt-4">{title}</h1>
          <p className="text-xs text-muted-foreground tracking-wide">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 w-10 rounded-full transition-colors ${i <= current ? "bg-foreground" : "bg-muted"}`} />
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-xs text-muted-foreground">{label}</label>{children}</div>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-right">{value || "—"}</span>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
