/**
 * Supabase Client Initialization
 * Integrates directly with Supabase storage, PostgreSQL, and Auth triggers.
 * Includes graceful local fallback protection to maintain 100% app responsiveness.
 */

import { createClient } from "@supabase/supabase-js";

// Simple robust client simulator for preview environments
export class SupabaseClientMock {
  auth = {
    async signUp(credentials: any) {
      console.log("[Supabase Auth Mock] Sign up user:", credentials.email);
      return { data: { user: { id: "user_mock_123", email: credentials.email, role: "USER" } }, error: null };
    },
    async signInWithPassword(credentials: any) {
      console.log("[Supabase Auth Mock] Sign in credentials:", credentials.email);
      if (credentials.email && credentials.password) {
        return { data: { user: { id: "user_mock_123", email: credentials.email, role: "MEMBER" }, session: { access_token: "jwt_mock_token_abc" } }, error: null };
      }
      return { data: { user: null, session: null }, error: new Error("Credentials missing") };
    },
    async signOut() {
      console.log("[Supabase Auth Mock] Sign out triggered");
      return { error: null };
    },
    async getSession() {
      return { data: { session: null }, error: null };
    }
  };

  storage = {
    from(bucket: string) {
      return {
        async upload(path: string, file: any) {
          return { data: { path: `${bucket}/${path}` }, error: null };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/${path}` } };
        }
      };
    }
  };
}

let supabaseInstance: any = null;

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  // Safe checks for both Node.js (express) and browser (Vite)
  const meta = import.meta as any;
  const url = (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : "") || 
              (meta.env?.VITE_SUPABASE_URL as string) || "";
  const anonKey = (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : "") || 
                  (meta.env?.VITE_SUPABASE_ANON_KEY as string) || "";

  if (url && anonKey) {
    try {
      console.log("[Supabase] Initializing real client with provided URL:", url);
      supabaseInstance = createClient(url, anonKey);
    } catch (e) {
      console.warn("[Supabase] Failed to initialize real library client, falling back to mock:", e);
      supabaseInstance = new SupabaseClientMock();
    }
  } else {
    console.warn("[Supabase] Keys missing in config. Safe mock dashboard mode enabled.");
    supabaseInstance = new SupabaseClientMock();
  }

  return supabaseInstance;
}
