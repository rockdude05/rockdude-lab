// 📚 학습: server-only import — 클라이언트 번들에 service_role 키가 섞이는 사고를 빌드 타임에 차단
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정");
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}
