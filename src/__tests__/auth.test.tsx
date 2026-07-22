import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({}),
  usePathname: () => "",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock @fontsource/* CSS imports
vi.mock("@fontsource/geist-sans/400.css", () => ({}));
vi.mock("@fontsource/geist-sans/500.css", () => ({}));
vi.mock("@fontsource/geist-sans/600.css", () => ({}));
vi.mock("@fontsource/geist-sans/700.css", () => ({}));
vi.mock("@fontsource/geist-mono/400.css", () => ({}));
vi.mock("@fontsource/geist-mono/500.css", () => ({}));
vi.mock("@fontsource/geist-mono/600.css", () => ({}));

// Mock auth context
const mockLogin = vi.fn();
let mockUser: unknown = null;
let mockLoading = false;

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockLoading,
    login: mockLogin,
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
  mockLogin.mockReset();
  mockUser = null;
  mockLoading = false;
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

  it("has LinkedIn SSO button", () => {
    render(<LoginPage />);
    expect(screen.getByText("Continue with LinkedIn")).toBeInTheDocument();
  });
});
