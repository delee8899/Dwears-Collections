"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type AuthFormProps = { mode: "login" | "register" };
type AuthResponse = { error?: string };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = (await response.json()) as AuthResponse;
      if (!response.ok)
        throw new Error(
          result.error ?? "We couldn't complete that request. Try again.",
        );
      if (isRegister) setCreated(true);
      else {
        router.replace("/shop");
        router.refresh();
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We couldn't complete that request. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">Dwears Collections</p>
      <h1>
        {created
          ? "You’re all set"
          : isRegister
            ? "Create your account"
            : "Welcome back"}
      </h1>
      {created ? (
        <>
          <p className="auth-description">
            Your account is ready. You’re signed in and can continue browsing.
          </p>
          <Link className="button" href="/shop">
            Continue shopping <span aria-hidden="true">→</span>
          </Link>
        </>
      ) : (
        <>
          <p className="auth-description">
            {isRegister
              ? "Create an account for a smoother shopping experience."
              : "Sign in to continue shopping."}
          </p>
          <form className="auth-form" onSubmit={submit}>
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? 12 : undefined}
                maxLength={128}
                required
              />
            </label>
            {isRegister && (
              <p className="auth-hint">Use 12 to 128 characters.</p>
            )}
            {error && (
              <p className="error-note" role="alert">
                {error}
              </p>
            )}
            <button className="button" type="submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : isRegister
                  ? "Create account"
                  : "Sign in"}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to Dwears?"}{" "}
            <Link href={isRegister ? "/account/login" : "/account/register"}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
