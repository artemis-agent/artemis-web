"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register({ email, name, password });
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-border">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[15px] font-semibold tracking-[0.04em] font-mono">
              artemis<span className="text-accent">.agent</span>
            </span>
          </Link>
          <CardTitle className="text-xl font-semibold">Create your account</CardTitle>
          <CardDescription className="text-xs">Start finding jobs at top companies</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}

            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Full name"
                className="h-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
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
                placeholder="Password (min 8 characters)"
                className="h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium hover:underline text-accent">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
