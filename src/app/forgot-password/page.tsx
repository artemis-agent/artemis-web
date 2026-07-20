"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, ShieldQuestion } from "lucide-react";
import {
  forgotPassword,
  verifySecurity,
  resetPassword,
} from "@/lib/api";

type Step = "email" | "answer" | "new-password" | "done";

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite book?",
  "What was the make of your first car?",
  "What street did you grow up on?",
  "What is the name of your childhood best friend?",
];

export { SECURITY_QUESTIONS };

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSecurityQuestion(res.security_question);
      setStep("answer");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process request"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifySecurity(email, answer);
      setResetToken(res.reset_token);
      setStep("new-password");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Incorrect answer"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setStep("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-border">
        <CardHeader className="text-center space-y-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 mb-2"
          >
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">
              Artemis
            </span>
          </Link>

          {step === "done" ? (
            <>
              <div className="flex justify-center">
                <CheckCircle2 className="h-10 w-10 text-foreground" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Password Reset
              </CardTitle>
              <CardDescription className="text-xs tracking-wide">
                Your password has been updated successfully
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <ShieldQuestion className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-semibold">
                {step === "email" && "Forgot Password"}
                {step === "answer" && "Security Question"}
                {step === "new-password" && "New Password"}
              </CardTitle>
              <CardDescription className="text-xs tracking-wide">
                {step === "email" && "Enter your email to get started"}
                {step === "answer" && "Answer your security question"}
                {step === "new-password" && "Choose a new password"}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {error && (
            <p className="text-xs text-destructive text-center mb-4">
              {error}
            </p>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                className="h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <Button
                type="submit"
                className="w-full h-10 text-sm"
                disabled={loading}
              >
                {loading ? "Looking up..." : "Continue"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to sign in
                </Link>
              </p>
            </form>
          )}

          {step === "answer" && (
            <form onSubmit={handleAnswerSubmit} className="space-y-4">
              <div className="rounded-md border border-border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Your security question:
                </p>
                <p className="text-sm font-medium">{securityQuestion}</p>
              </div>
              <Input
                type="text"
                placeholder="Your answer"
                className="h-10"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                autoFocus
              />
              <Button
                type="submit"
                className="w-full h-10 text-sm"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Answer"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError("");
                  }}
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Try a different email
                </button>
              </p>
            </form>
          )}

          {step === "new-password" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="New password"
                  className="h-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                  minLength={8}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="h-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Must be at least 8 characters
              </p>
              <Button
                type="submit"
                className="w-full h-10 text-sm"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          {step === "done" && (
            <div className="space-y-4">
              <Button
                className="w-full h-10 text-sm"
                onClick={() => router.push("/login")}
              >
                Sign in with new password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
