import { http, HttpResponse, delay } from "msw";
import { createJob, createCompany, createUser, createStats, createRecommendation, createResume, paginated, fixtures } from "./data/factories";

const BASE = "http://localhost:8080/api/v1";

export const handlers = [
  http.get(`${BASE}/jobs`, () => {
    const jobs = Array.from({ length: 5 }, () => createJob());
    return HttpResponse.json(paginated(jobs, 42));
  }),

  http.get(`${BASE}/jobs/search`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const jobs = q
      ? Array.from({ length: 3 }, () => createJob({ title: `${q} - Senior Engineer` }))
      : [];
    return HttpResponse.json({ data: jobs, total: jobs.length, query: q });
  }),

  http.get(`${BASE}/jobs/:id`, ({ params }) => {
    return HttpResponse.json(createJob({ id: params.id as string }));
  }),

  http.get(`${BASE}/public/jobs`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const data = q
      ? Array.from({ length: 4 }, (_, i) => ({
          id: `pub-job-${i}`,
          title: `Public ${q} Role ${i}`,
          company_name: "PublicCo",
          company_slug: "publicco",
          location: "Remote",
          source: "Greenhouse",
          date_posted: new Date().toISOString(),
        }))
      : [];
    return HttpResponse.json({ data, total: data.length, query: q });
  }),

  http.get(`${BASE}/companies`, () => {
    return HttpResponse.json(paginated([createCompany()], 1));
  }),

  http.get(`${BASE}/companies/:slug`, ({ params }) => {
    return HttpResponse.json(createCompany({ slug: params.slug as string }));
  }),

  http.get(`${BASE}/companies/:slug/jobs`, () => {
    return HttpResponse.json(paginated([createJob()], 1));
  }),

  http.post(`${BASE}/users`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(createUser({ email: body?.email as string, name: body?.name as string }));
  }),

  http.get(`${BASE}/users/:id`, ({ params }) => {
    return HttpResponse.json(createUser({ id: params.id as string }));
  }),

  http.put(`${BASE}/users/:id`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(createUser({ ...body, id: request.url.split("/users/")[1]?.split("/")[0] }));
  }),

  http.post(`${BASE}/users/:userId/resume`, () => {
    return HttpResponse.json({ message: "uploaded", resume_id: "res-123", s3_key: "s3://key", filename: "resume.pdf" });
  }),

  http.get(`${BASE}/users/:userId/resume`, () => {
    return HttpResponse.json(createResume());
  }),

  http.get(`${BASE}/users/:userId/resume/progress`, ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({ stage: `Parsing ${url.searchParams.get("resume_id")}`, percent: 75 });
  }),

  http.get(`${BASE}/users/:userId/recommendations`, () => {
    const recs = Array.from({ length: 4 }, () => createRecommendation());
    return HttpResponse.json({ recommendations: recs, total: recs.length });
  }),

  http.post(`${BASE}/hunt`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ status: "hunting", company: body?.company_name });
  }),

  http.get(`${BASE}/stats`, () => {
    return HttpResponse.json(createStats());
  }),

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ token: fixtures.token, user: createUser({ email: body?.email as string, name: body?.name as string }) });
  }),

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if ((body?.password as string) === "wrong") {
      return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    return HttpResponse.json({ token: fixtures.token, user: createUser({ email: body?.email as string }) });
  }),

  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json(createUser());
  }),

  http.post(`${BASE}/auth/forgot-password`, async () => {
    await delay(100);
    return HttpResponse.json({ security_question: "What was your first pet's name?" });
  }),

  http.post(`${BASE}/auth/verify-security`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if ((body?.answer as string) === "wrong") {
      return HttpResponse.json({ error: "Incorrect answer" }, { status: 401 });
    }
    return HttpResponse.json({ reset_token: "reset-token-abc" });
  }),

  http.post(`${BASE}/auth/reset-password`, () => {
    return HttpResponse.json({ message: "Password reset successfully" });
  }),

  http.post(`${BASE}/auth/security-question`, () => {
    return HttpResponse.json({ message: "Security question set" });
  }),

  http.post(`${BASE}/auth/onboarding`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(createUser({ headline: body?.headline as string, onboarding_completed: true }));
  }),

  http.get(`${BASE}/saved`, () => {
    return HttpResponse.json({ data: [createJob()], total: 1 });
  }),

  http.get(`${BASE}/saved/ids`, () => {
    return HttpResponse.json({ ids: ["job-1", "job-2", "job-3"] });
  }),

  http.post(`${BASE}/saved/:jobId`, () => {
    return HttpResponse.json({ status: "saved" });
  }),

  http.delete(`${BASE}/saved/:jobId`, () => {
    return HttpResponse.json({ status: "unsaved" });
  }),

  http.put(`${BASE}/users/:userId/preferences`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(createUser({ preferences: body }));
  }),
];
