import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

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

const mockUser = {
  id: "user-abc",
  email: "test@example.com",
  name: "Test User",
  onboarding_completed: true,
};

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("DashboardPage", () => {
  it("renders welcome header with user name", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome Test/)).toBeInTheDocument();
    });
  });

  it("renders nav with links", () => {
    render(<DashboardPage />);
    const navLinks = screen.getAllByRole("link");
    const searchLink = navLinks.find((l) => l.getAttribute("href") === "/dashboard/search");
    const savedLink = navLinks.find((l) => l.getAttribute("href") === "/dashboard/saved");
    expect(searchLink).toBeTruthy();
    expect(savedLink).toBeTruthy();
  });

  it("loads recommendations from MSW", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("Top Picks For You")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders search section with suggestion tags", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("Engineering")).toBeInTheDocument();
    });
  });

  it("shows saved jobs section", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("Your Saved Jobs")).toBeInTheDocument();
    });
  });
});
