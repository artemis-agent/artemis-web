import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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

const mockLogin = vi.fn();
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: mockLogin,
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
  mockLogin.mockReset();
  mockPush.mockReset();
});

describe("LoginPage", () => {
  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("navigates to dashboard on successful login", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginPage />);
    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays error message on login failure", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<LoginPage />);
    await user.type(screen.getByPlaceholderText("Email"), "bad@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("has links to signup and forgot password", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sign up").closest("a")).toHaveAttribute("href", "/signup");
    expect(screen.getByText("Forgot password?").closest("a")).toHaveAttribute("href", "/forgot-password");
  });
});
