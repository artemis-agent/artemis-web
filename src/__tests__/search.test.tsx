import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

describe("SearchPage", () => {
  it("renders nav with links", () => {
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

  it("renders filter selects", async () => {
    render(<SearchPage />);
    await waitFor(() => {
      const triggers = document.querySelectorAll('[data-slot="select-trigger"]');
      expect(triggers.length).toBeGreaterThanOrEqual(3);
    });
  });
});
