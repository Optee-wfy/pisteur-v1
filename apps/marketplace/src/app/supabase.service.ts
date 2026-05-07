import { BEARER_TOKEN_PREFIX } from "@optee/constants";
import { environment } from "@optee/env";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { Observable, shareReplay, startWith } from "rxjs";

const isPreview = location.hostname.includes("web.app");

const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: !isPreview,
      storage: isPreview ? sessionStorage : localStorage,
    },
  },
);

export const SupabaseService = {
  auth$: new Observable<{ event: string; session: Session | null }>(
    (subscriber) => {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        subscriber.next({ event, session });
      });

      return () => {
        data.subscription.unsubscribe();
      };
    },
  ).pipe(shareReplay(1)),

  isAuthenticated$: new Observable<boolean>((subscriber) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      subscriber.next(!!session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }).pipe(startWith(false), shareReplay(1)),

  async getHeaders() {
    const session = await this.getSession();

    if (!session) {
      return {};
    }

    return {
      authorization: `${BEARER_TOKEN_PREFIX} ${session.access_token}`,
    };
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  },

  signOut() {
    return supabase.auth.signOut();
  },

  async getSession() {
    const sessionRes = await supabase.auth.getSession();
    return sessionRes.data.session ?? null;
  },

  async verifyResetPasswordToken(tokenHash: string) {
    return supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });
  },

  updatePasswordForLoggedInUser(newPassword: string) {
    return supabase.auth.updateUser({ password: newPassword });
  },

  async getUserByToken(token: string) {
    return supabase.auth.getUser(token);
  },

  updateUserPassword(email: string, password: string) {
    return supabase.auth.updateUser({ email, password });
  },

  signInWithAzure() {
    return supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "email",
        redirectTo: "/",
      },
    });
  },

  signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "/",
      },
    });
  },

  clearLocalStorageAuthTokens() {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-") && key.endsWith("auth-token")) {
        localStorage.removeItem(key);
      }
    }
  },
};
