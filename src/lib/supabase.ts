const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://deflgdidhdtqnjqjvdzo.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_9FRJtaWfe6wH-WBAOf6FGg___6orI62";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

export async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, Prefer: "return=representation", ...init.headers },
  });

  if (!response.ok) throw new Error(`Supabase ${response.status}`);
  if (response.status === 204) return [] as T;
  return response.json() as Promise<T>;
}

export async function createSupabaseAdminUser(input: { name: string; email: string; password: string; role: string }) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-admin-user`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`Supabase function ${response.status}`);
  return response.json() as Promise<{ id: string }>;
}
