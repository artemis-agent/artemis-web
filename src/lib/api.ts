const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

const TOKEN_KEY = "artemis_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API ${res.status}`);
  }
  return res.json();
}

// ── Types matching Go models ──────────────────────────────────

export interface ApiJob {
  id: string;
  external_id?: string;
  company_id: string;
  company_name?: string;
  company_slug?: string;
  title: string;
  url: string;
  location?: string;
  description?: string;
  date_posted?: string;
  source?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  normalized_at?: string;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  similarity?: number;
  check_status?: string;
  last_checked_at?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  short_summary?: string;
  visa_sponsorship?: boolean;
}

export interface ApiCompany {
  id: string;
  name: string;
  slug: string;
  ats_type: string;
  careers_url: string;
  status: string;
  last_scraped_at?: string;
  created_at: string;
  updated_at: string;
  job_count?: number;
  description?: string;
  logo_url?: string;
  company_size?: string;
  funding_stage?: string;
  headquarters?: string;
  is_public?: boolean;
  industry?: string;
  website?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  headline?: string;
  summary?: string;
  profile_photo_url?: string;
  location?: string;
  seniority_level?: string;
  years_experience?: number;
  desired_roles?: string[];
  onboarding_completed: boolean;
  profile?: Record<string, unknown>;
  profile_score?: number;
  profile_assessment?: string;
  preferences?: Record<string, unknown>;
  security_question?: string;
  security_question_set: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResume {
  id: string;
  user_id: string;
  s3_key: string;
  filename: string;
  parsed_data?: Record<string, unknown>;
  uploaded_at: string;
  parsed_at?: string;
}

export interface ApiStats {
  total_jobs: number;
  active_jobs: number;
  total_companies: number;
  last_scraped_at: string;
}

export interface ApiRecommendation {
  job_id: string;
  title: string;
  url: string;
  location?: string;
  company_name: string;
  company_slug: string;
  source?: string;
  score: number;
  signals: {
    vector_similarity: number;
    skill_overlap: number;
    category_match: number;
    location_match: number;
    seniority_match: number;
    role_match: number;
    recency: number;
  };
  matched_skills?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ── Jobs ──────────────────────────────────────────────────────

export interface ListJobsParams {
  keyword?: string;
  company?: string;
  location?: string;
  seniority?: string;
  employment_type?: string;
  page?: number;
  per_page?: number;
}

export function listJobs(params: ListJobsParams = {}) {
  const qs = new URLSearchParams();
  if (params.keyword) qs.set("keyword", params.keyword);
  if (params.company) qs.set("company", params.company);
  if (params.location) qs.set("location", params.location);
  if (params.seniority) qs.set("seniority", params.seniority);
  if (params.employment_type) qs.set("employment_type", params.employment_type);
  if (params.page) qs.set("page", String(params.page));
  if (params.per_page) qs.set("per_page", String(params.per_page));
  return apiFetch<PaginatedResponse<ApiJob>>(`/jobs?${qs}`);
}

export interface SearchJobsParams {
  q: string;
  company?: string;
  location?: string;
  seniority?: string;
  limit?: number;
}

export function searchJobs(params: SearchJobsParams) {
  const qs = new URLSearchParams({ q: params.q });
  if (params.company) qs.set("company", params.company);
  if (params.location) qs.set("location", params.location);
  if (params.seniority) qs.set("seniority", params.seniority);
  if (params.limit) qs.set("limit", String(params.limit));
  return apiFetch<{ data: ApiJob[]; total: number; query: string }>(`/jobs/search?${qs}`);
}

export function getJob(id: string) {
  return apiFetch<ApiJob>(`/jobs/${id}`);
}

// Public search (no auth, returns previews only)
export interface JobPreview {
  id: string;
  title: string;
  company_name?: string;
  company_slug?: string;
  location?: string;
  source?: string;
  date_posted?: string;
}

export function searchJobsPublic(q: string) {
  return apiFetch<{ data: JobPreview[]; total: number; query: string }>(`/public/jobs?q=${encodeURIComponent(q)}`);
}

// ── Companies ─────────────────────────────────────────────────

export function listCompanies(page = 1, perPage = 20) {
  return apiFetch<PaginatedResponse<ApiCompany>>(`/companies?page=${page}&per_page=${perPage}`);
}

export function getCompany(slug: string) {
  return apiFetch<ApiCompany>(`/companies/${slug}`);
}

export function getCompanyJobs(slug: string, params: { keyword?: string; page?: number; per_page?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.keyword) qs.set("keyword", params.keyword);
  if (params.page) qs.set("page", String(params.page));
  if (params.per_page) qs.set("per_page", String(params.per_page));
  return apiFetch<PaginatedResponse<ApiJob>>(`/companies/${slug}/jobs?${qs}`);
}

// ── Users ─────────────────────────────────────────────────────

export function createUser(data: { email: string; name: string; location?: string }) {
  return apiFetch<ApiUser>("/users", { method: "POST", body: JSON.stringify(data) });
}

export function getUser(id: string) {
  return apiFetch<ApiUser>(`/users/${id}`);
}

export function updateUser(id: string, data: { name?: string; location?: string }) {
  return apiFetch<ApiUser>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

// ── Resume ────────────────────────────────────────────────────

export async function uploadResume(userId: string, file: File) {
  const form = new FormData();
  form.append("resume", file);
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/users/${userId}/resume`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Upload failed ${res.status}`);
  }
  return res.json() as Promise<{ message: string; resume_id: string; s3_key: string; filename: string }>;
}

export function getResume(userId: string) {
  return apiFetch<ApiResume>(`/users/${userId}/resume`);
}

export function getParseProgress(userId: string, resumeId: string) {
  return apiFetch<{ stage: string; percent: number }>(`/users/${userId}/resume/progress?resume_id=${resumeId}`);
}

// ── Recommendations ───────────────────────────────────────────

export function getRecommendations(userId: string, limit = 20) {
  return apiFetch<{ recommendations: ApiRecommendation[]; total: number }>(
    `/users/${userId}/recommendations?limit=${limit}`
  );
}

// ── Hunt ──────────────────────────────────────────────────────

export function huntCompany(companyName: string, careersUrl?: string) {
  return apiFetch<Record<string, unknown>>("/hunt", {
    method: "POST",
    body: JSON.stringify({ company_name: companyName, careers_url: careersUrl }),
  });
}

// ── Stats ─────────────────────────────────────────────────────

export function getStats() {
  return apiFetch<ApiStats>("/stats");
}

// ── Helpers: convert API types to frontend display types ──────

export function apiJobToDisplay(job: ApiJob) {
  const meta = (job.metadata ?? {}) as Record<string, unknown>;
  const skills = Array.isArray(meta.skills) ? (meta.skills as string[]) : [];

  const salaryMin = job.salary_min ?? (meta.salary_min as number | undefined);
  const salaryMax = job.salary_max ?? (meta.salary_max as number | undefined);
  let salaryRange: string | undefined;
  if (salaryMin && salaryMax && salaryMin !== salaryMax) {
    salaryRange = `$${Math.round(salaryMin / 1000)}K – $${Math.round(salaryMax / 1000)}K`;
  } else if (salaryMin) {
    salaryRange = `$${Math.round(salaryMin / 1000)}K`;
  }

  return {
    id: job.id,
    title: job.title,
    companyName: job.company_name ?? "",
    companySlug: job.company_slug ?? "",
    location: job.location ?? "Remote",
    description: job.description ?? "",
    source: capitalize(job.source ?? "Unknown"),
    seniority: capitalize((meta.seniority_level as string) ?? "Mid"),
    department: capitalize((meta.department as string) ?? "Engineering"),
    skills,
    postedAgo: formatTimeAgo(job.date_posted ?? job.created_at),
    url: job.url,
    matchScore: job.similarity ? Math.round(job.similarity * 100) : undefined,
    employmentType: capitalize((meta.employment_type as string) ?? "Full-time"),
    locationType: capitalize((meta.remote_type as string) ?? (meta.location_type as string) ?? ""),
    salaryRange,
    shortSummary: job.short_summary,
    visaSponsorship: job.visa_sponsorship ?? (meta.visa_sponsorship as boolean | undefined),
    aboutCompany: undefined as string | undefined,
  };
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Auth ──────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export function register(data: { email: string; name: string; password: string; location?: string }) {
  return apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) });
}

export function login(data: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export function forgotPassword(email: string) {
  return apiFetch<{ security_question: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifySecurity(email: string, answer: string) {
  return apiFetch<{ reset_token: string }>("/auth/verify-security", {
    method: "POST",
    body: JSON.stringify({ email, answer }),
  });
}

export function resetPassword(reset_token: string, new_password: string) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ reset_token, new_password }),
  });
}

export function setSecurityQuestion(question: string, answer: string) {
  return apiFetch<{ message: string }>("/auth/security-question", {
    method: "POST",
    body: JSON.stringify({ question, answer }),
  });
}

export function getMe() {
  return apiFetch<ApiUser>("/auth/me");
}

export interface OnboardingData {
  headline: string;
  summary?: string;
  seniority_level: string;
  years_experience: number;
  location: string;
  desired_roles: string[];
  skills: string[];
  experience?: string;
  education?: string;
  certifications?: string;
  projects?: string;
  languages?: string[];
}

export function completeOnboarding(data: OnboardingData) {
  return apiFetch<ApiUser>("/auth/onboarding", { method: "POST", body: JSON.stringify(data) });
}

// updateProfile is an alias for the onboarding endpoint, used from the
// profile edit page after the user has already onboarded. The backend
// triggers a fire-and-forget user-embedding refresh on success.
export function updateProfile(data: OnboardingData) {
  return apiFetch<ApiUser>("/auth/onboarding", { method: "POST", body: JSON.stringify(data) });
}

// ── Saved Jobs ────────────────────────────────────────────────

export function listSavedJobs() {
  return apiFetch<{ data: ApiJob[]; total: number }>("/saved");
}

export function listSavedJobIDs() {
  return apiFetch<{ ids: string[] }>("/saved/ids");
}

export function saveJob(jobId: string) {
  return apiFetch<{ status: string }>(`/saved/${jobId}`, { method: "POST" });
}

export function unsaveJob(jobId: string) {
  return apiFetch<{ status: string }>(`/saved/${jobId}`, { method: "DELETE" });
}

// ── Preferences ───────────────────────────────────────────────

export function updatePreferences(userId: string, prefs: Record<string, unknown>) {
  return apiFetch<ApiUser>(`/users/${userId}/preferences`, {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
}
