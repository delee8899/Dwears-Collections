import type { Metadata } from "next";
import { AuthForm } from "@/frontend/features/auth/auth-form";

export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return <main className="auth-page"><AuthForm mode="register" /></main>;
}
