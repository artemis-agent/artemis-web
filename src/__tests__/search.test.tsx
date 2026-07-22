import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchPage from "@/app/dashboard/search/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({}),
  usePathname: () => "",
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@fontsource/geist-sans/400.css", () => ({}));
vi.mock("@fontsource/geist-sans/500.css", () => ({}));
vi.mock("@fontsource/geist-sans/600.css", () => ({}));
vi.mock("@fontsource/geist-sans/700.css", () => ({}));
vi.mock("@fontsource/geist-mono/400.css", () => ({}));
vi.mock("@fontsource/geist-mono/500.css", () => ({}));
vi.mock("@fontsource/geist-mono/600.css", () => ({}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "user-abc", email: "test@example.com", name: "Test User" },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
  // localStorage cleared automatically by setup.ts
});

describe("SearchPage", () => {
  it("renders the job search page with nav", () => {
    render(<SearchPage />);
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Saved").closest("a")).toHaveAttribute("href", "/dashboard/saved");
  });

  it("loads initial job results from MSW", async () => {
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText(/results/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders filter selects: Job Type, Department, Sort by", async () => {
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText("Job Type")).toBeInTheDocument();
      expect(screen.getByText("Department")).toBeInTheDocument();
      expect(screen.getByText("Sort by")).toBeInTheDocument();
    });
  });

  it("renders the hunt a company card", async () => {
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText("Can't find a company?")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Company name")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Hunt" })).toBeInTheDocument();
    });
  });

  it("hunt button is disabled when input is empty", async () => {
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Hunt" })).toBeDisabled();
    });
  });

  it("hunt button enables after typing company name", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    const input = await screen.findByPlaceholderText("Company name");
    await user.type(input, "Acme");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Hunt" })).not.toBeDisabled();
    });
  });
});
