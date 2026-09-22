export const ADMIN_EMAIL = "markusfourie@icloud.com";

export function isAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}
