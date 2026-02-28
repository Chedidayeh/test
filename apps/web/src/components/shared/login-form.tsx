"use client";

import React, { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { loginAction, registerAction } from "@/src/lib/auth-service/server-actions";

interface LoginFormProps extends React.ComponentProps<"div"> {
  /** If true, don't render the built-in Dialog trigger button (use when controlling via provider) */
  hideTrigger?: boolean;
  /** Controlled open state for the dialog (optional) */
  open?: boolean;
  /** Controlled open change handler (optional) */
  onOpenChange?: (open: boolean) => void;
}

export function LoginForm({ className, hideTrigger = false, open, onOpenChange }: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Signup validation
        if (!name.trim()) {
          throw new Error("Full name is required");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        // Step 1: Call server action for registration
        const registerResult = await registerAction({ email, password, name });

        if (!registerResult.success) {
          setError(registerResult.error?.message || "Registration failed");
          return;
        }

        // Step 2: Call loginAction to get token
        const loginResult = await loginAction({ email, password });

        if (!loginResult.success) {
          setError(loginResult.error?.message || "Login failed after registration");
          return;
        }

        // Step 3: Sign in with credentials to establish NextAuth session
        await signIn("credentials", {
          redirect: true,
          email,
          password,
          callbackUrl: "/",
        });

        toast.success("Account created and logged in successfully!");
      } else {
        // Login flow: validate credentials first via server action
        const loginResult = await loginAction({ email, password });

        if (!loginResult.success) {
          setError(loginResult.error?.message || "Login failed");
          return;
        }

        // Sign in with credentials to establish NextAuth session
        await signIn("credentials", {
          redirect: true,
          email,
          password,
          callbackUrl: "/",
        });

        toast.success("Logged in successfully!");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      setError(message);
      console.error("[LoginForm] Auth error:", message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button id="about">Login</Button>
        </DialogTrigger>
      )}
      <DialogTitle></DialogTitle>
      <DialogContent showCloseButton={false}>
        <div className={cn("flex flex-col space-y-1", className)}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {isSignUp ? "Create an account" : "Welcome back"}
              </CardTitle>
              <CardDescription>
                {isSignUp
                  ? "Sign up to get started"
                  : "Login with your email and password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border text-red-700 rounded text-sm">
                      {error}
                    </div>
                  )}

                  {/* Google OAuth - temporarily disabled */}
                  {/* <Field>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isSignUp ? "Sign up with Google" : "Login with Google"}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator> */}

                  {isSignUp && (
                    <Field>
                      <FieldLabel htmlFor="name">Full name</FieldLabel>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        className="bg-background"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      className="bg-background"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Field>

                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      {!isSignUp && (
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="********"
                        className="pr-10 bg-background"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:bg-muted/10"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>

                  {isSignUp && (
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          placeholder="********"
                          className="pr-10 bg-background"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:bg-muted/10"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          Passwords do not match
                        </p>
                      )}
                      {password && password.length < 8 && (
                        <p className="text-sm text-yellow-600 mt-1">
                          Password must be at least 8 characters
                        </p>
                      )}
                    </Field>
                  )}

                  <Field>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading
                        ? "Loading..."
                        : isSignUp
                          ? "Create account"
                          : "Login"}
                    </Button>
                    <FieldDescription className="text-center">
                      {isSignUp ? (
                        <>
                          Already have an account?{" "}
                          <button
                            type="button"
                            className="underline-offset-4 hover:underline"
                            onClick={() => setIsSignUp(false)}
                            disabled={isLoading}
                          >
                            Log in
                          </button>
                        </>
                      ) : (
                        <>
                          Don&apos;t have an account?{" "}
                          <button
                            type="button"
                            className="underline-offset-4 hover:underline"
                            onClick={() => setIsSignUp(true)}
                            disabled={isLoading}
                          >
                            Sign up
                          </button>
                        </>
                      )}
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}
