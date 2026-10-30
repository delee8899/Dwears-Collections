import type { Metadata } from "next";
import { AuthForm } from "@/frontend/features/auth/auth-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return <main className="auth-page"><AuthForm mode="login" /></main>;
}
