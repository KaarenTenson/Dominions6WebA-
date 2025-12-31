import { SERVER_ENDPOINT } from "./constants";

// auth.ts
export async function hasValidCookie(): Promise<boolean> {
  const res = await fetch(`${SERVER_ENDPOINT}/me`, {
    credentials: "include",
  });
  return res.ok;
}
export const checkAdminAccess = async(): Promise<boolean> => {
  const res = await fetch(`${SERVER_ENDPOINT}/admin/is_admin`, {
    credentials: "include",
  });
  return res.ok;
}

