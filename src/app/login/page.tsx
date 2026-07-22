"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[15px] font-semibold tracking-[0.04em] font-mono">
              artemis<span className="text-accent">.agent</span>
            </span>
          </Link>
          <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
          <CardDescription className="text-xs">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                className="h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                className="h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Link href="/forgot-password" className="text-xs hover:underline">
                Forgot password?
              </Link>
              <p>
                <Link href="/signup" className="font-medium hover:underline text-accent">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
