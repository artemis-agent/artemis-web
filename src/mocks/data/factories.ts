import type {
  ApiJob,
  ApiCompany,
  ApiUser,
  ApiStats,
  ApiRecommendation,
  ApiResume,
  PaginatedResponse,
} from "@/lib/api";

type DeepPartial<T> = T extends Array<infer U>
  ? Array<U>
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

let _counter = 0;
function uid(prefix = "") {
  return `${prefix}${++_counter}-${Math.random().toString(36).slice(2, 8)}`;
}

function ts() {
  return new Date().toISOString();
}

export function createJob(overrides: DeepPartial<ApiJob> = {}): ApiJob {
  const id = overrides.id ?? uid("job-");
  return {
    id,
    company_id: uid("comp-"),
    company_name: "Stripe",
    company_slug: "stripe",
    title: "Senior Frontend Engineer",
    url: `https://stripe.com/jobs/${id}`,
    location: "San Francisco, CA",
    description: "Build and maintain payment UI components used by millions.",
    date_posted: ts(),
    source: "Greenhouse",
    is_active: true,
    first_seen_at: ts(),
    last_seen_at: ts(),
    created_at: ts(),
    short_summary: "Senior FE role at Stripe.",
    ...overrides,
  };
}

export function createCompany(overrides: DeepPartial<ApiCompany> = {}): ApiCompany {
  const id = overrides.id ?? uid("comp-");
  return {
    id,
    name: "Stripe",
    slug: "stripe",
    ats_type: "greenhouse",
    careers_url: "https://stripe.com/jobs",
    status: "active",
    created_at: ts(),
    updated_at: ts(),
    job_count: 42,
    description: "Financial infrastructure platform.",
    industry: "Fintech",
    company_size: "1001-5000",
    headquarters: "San Francisco, CA",
    ...overrides,
  };
}

export function createUser(overrides: DeepPartial<ApiUser> = {}): ApiUser {
  return {
    id: uid("user-"),
    email: "test@example.com",
    name: "Test User",
    onboarding_completed: true,
    security_question_set: true,
    created_at: ts(),
    updated_at: ts(),
    ...overrides,
  };
}

export function createStats(overrides: Partial<ApiStats> = {}): ApiStats {
  return {
    total_jobs: 1250,
    active_jobs: 980,
    total_companies: 340,
    last_scraped_at: ts(),
    ...overrides,
  };
}

export function createRecommendation(
  overrides: DeepPartial<ApiRecommendation> = {}
): ApiRecommendation {
  return {
    job_id: uid("job-"),
    title: "Senior Engineer",
    url: "https://example.com/job",
    location: "Remote",
    company_name: "Stripe",
    company_slug: "stripe",
    source: "Greenhouse",
    score: 0.92,
    signals: {
      vector_similarity: 0.88,
      skill_overlap: 0.91,
      category_match: 0.95,
      location_match: 1.0,
      seniority_match: 0.9,
      role_match: 0.87,
      recency: 0.93,
    },
    matched_skills: ["React", "TypeScript", "GraphQL"],
    ...overrides,
  } as ApiRecommendation;
}

export function createResume(overrides: DeepPartial<ApiResume> = {}): ApiResume {
  return {
    id: uid("resume-"),
    user_id: uid("user-"),
    s3_key: "resumes/test.pdf",
    filename: "resume.pdf",
    uploaded_at: ts(),
    ...overrides,
  };
}

export function paginated<T>(data: T[], total?: number): PaginatedResponse<T> {
  return {
    data,
    total: total ?? data.length,
    page: 1,
    per_page: 50,
    total_pages: Math.ceil((total ?? data.length) / 50),
  };
}

export const fixtures = {
  job: createJob(),
  company: createCompany(),
  user: createUser(),
  stats: createStats(),
  recommendation: createRecommendation(),
  resume: createResume(),
  token: "mock-jwt-token-abc123",
};
