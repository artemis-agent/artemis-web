import { describe, it, expect } from "vitest";
import {
  getToken,
  setToken,
  clearToken,
  listJobs,
  searchJobs,
  getJob,
  searchJobsPublic,
  getCompany,
  listCompanies,
  getCompanyJobs,
  getStats,
  getRecommendations,
  huntCompany,
  register,
  login,
  forgotPassword,
  verifySecurity,
  resetPassword,
  getMe,
  completeOnboarding,
  listSavedJobs,
  listSavedJobIDs,
  saveJob,
  unsaveJob,
  uploadResume,
  getResume,
  getParseProgress,
  updatePreferences,
} from "@/lib/api";

describe("auth functions", () => {
  it("register returns token + user", async () => {
    const res = await register({ email: "a@b.com", name: "A", password: "pass" });
    expect(res.token).toBeTypeOf("string");
    expect(res.user.email).toBe("a@b.com");
  });

  it("login returns token + user on success", async () => {
    const res = await login({ email: "a@b.com", password: "any" });
    expect(res.token).toBeTypeOf("string");
  });

  it("login throws on wrong password (handler returns 401)", async () => {
    await expect(login({ email: "a@b.com", password: "wrong" })).rejects.toThrow("Invalid credentials");
  });

  it("getMe returns user profile", async () => {
    const user = await getMe();
    expect(user.id).toBeTypeOf("string");
  });

  it("forgotPassword returns security question", async () => {
    const res = await forgotPassword("a@b.com");
    expect(res.security_question).toBe("What was your first pet's name?");
  });

  it("verifySecurity returns reset token on correct answer", async () => {
    const res = await verifySecurity("a@b.com", "correct");
    expect(res.reset_token).toBe("reset-token-abc");
  });

  it("verifySecurity throws on wrong answer", async () => {
    await expect(verifySecurity("a@b.com", "wrong")).rejects.toThrow("Incorrect answer");
  });

  it("completeOnboarding returns updated user", async () => {
    const user = await completeOnboarding({
      headline: "Engineer",
      seniority_level: "senior",
      years_experience: 5,
      location: "Remote",
      desired_roles: ["Engineer"],
      skills: ["React"],
    });
    expect(user.onboarding_completed).toBe(true);
  });
});

describe("jobs functions", () => {
  it("listJobs returns paginated response", async () => {
    const res = await listJobs();
    expect(res.data.length).toBe(5);
    expect(res.total).toBe(42);
  });

  it("searchJobs returns filtered results", async () => {
    const res = await searchJobs({ q: "react" });
    expect(res.data.length).toBe(3);
    expect(res.query).toBe("react");
  });

  it("getJob returns job by id", async () => {
    const job = await getJob("job-abc");
    expect(job.id).toBe("job-abc");
  });

  it("searchJobsPublic returns previews", async () => {
    const res = await searchJobsPublic("engineer");
    expect(res.data.length).toBe(4);
  });
});

describe("companies", () => {
  it("listCompanies returns paginated", async () => {
    const res = await listCompanies();
    expect(res.data.length).toBe(1);
  });

  it("getCompany returns company by slug", async () => {
    const company = await getCompany("stripe");
    expect(company.slug).toBe("stripe");
  });
});

describe("stats, recommendations, hunt", () => {
  it("getStats returns platform stats", async () => {
    const stats = await getStats();
    expect(stats.active_jobs).toBe(980);
  });

  it("getRecommendations returns scored jobs", async () => {
    const res = await getRecommendations("user-1", 5);
    expect(res.recommendations.length).toBe(4);
    expect(res.recommendations[0].score).toBeGreaterThan(0.9);
  });

  it("huntCompany posts company name", async () => {
    const res = await huntCompany("AcmeCorp");
    expect(res.status).toBe("hunting");
  });
});

describe("saved jobs", () => {
  it("listSavedJobs returns saved jobs", async () => {
    const res = await listSavedJobs();
    expect(res.data.length).toBe(1);
  });

  it("listSavedJobIDs returns ID set", async () => {
    const res = await listSavedJobIDs();
    expect(res.ids).toEqual(["job-1", "job-2", "job-3"]);
  });

  it("saveJob returns status", async () => {
    const res = await saveJob("job-x");
    expect(res.status).toBe("saved");
  });

  it("unsaveJob returns status", async () => {
    const res = await unsaveJob("job-x");
    expect(res.status).toBe("unsaved");
  });
});

describe("resume", () => {
  it("getResume returns resume data", async () => {
    const res = await getResume("user-1");
    expect(res.filename).toBe("resume.pdf");
  });

  it("getParseProgress returns progress", async () => {
    const res = await getParseProgress("user-1", "res-abc");
    expect(res.percent).toBe(75);
  });

  it("uploadResume posts FormData", async () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    const res = await uploadResume("user-1", file);
    expect(res.message).toBe("uploaded");
  });
});

describe("token management", () => {
  it("setToken stores and getToken retrieves", () => {
    setToken("my-token");
    expect(getToken()).toBe("my-token");
  });

  it("clearToken removes token", () => {
    setToken("my-token");
    clearToken();
    expect(getToken()).toBeNull();
  });
});
