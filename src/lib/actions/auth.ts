"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/supabase/types";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required.", code: "VALIDATION" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: error.message, code: "AUTH_LOGIN_FAILED" };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: undefined, next: "/dashboard" };
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return { ok: false, error: "Use a valid email and a password of at least 8 characters.", code: "VALIDATION" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback` },
  });
  if (error) {
    return { ok: false, error: error.message, code: "AUTH_REGISTER_FAILED" };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: undefined, next: "/onboarding/profile" };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { ok: false, error: "Email is required.", code: "VALIDATION" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/profile`,
  });
  if (error) {
    return { ok: false, error: error.message, code: "AUTH_RESET_FAILED" };
  }

  return { ok: true, data: undefined };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
