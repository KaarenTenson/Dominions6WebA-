// auth.ts
export async function hasValidCookie(): Promise<boolean> {
  const res = await fetch("http://localhost:3000/me", {
    credentials: "include",
  });
  return res.ok;
}
