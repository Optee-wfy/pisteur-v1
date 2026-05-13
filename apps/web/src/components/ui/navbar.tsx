"use client";

import LoadingRadar from "@/components/ui/loading-radar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({ user }: { user: User }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="relative z-10 bg-white shadow-o">
      <nav className="mx-auto flex max-w-[1480px] items-center px-4 py-4 xl:px-10">
        <a href="/leads" className="mr-8 flex items-center gap-2.5">
          <LoadingRadar size={26} />
          <span className="font-display text-xl font-bold text-primary-700">optee</span>
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">pisteur</span>
        </a>

        <div className="flex items-center gap-1">
          <a
            href="/leads"
            className="rounded-lg px-3 py-2 text-sm font-medium text-granite-700 transition hover:bg-gray-100 hover:text-granite-900"
          >
            Leads
          </a>
          <a
            href="/pisteur"
            className="rounded-lg px-3 py-2 text-sm font-medium text-granite-700 transition hover:bg-gray-100 hover:text-granite-900"
          >
            Pisteur
          </a>
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-granite-700 transition hover:bg-gray-100"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {user.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <span className="hidden sm:block">{user.email}</span>
            <svg className="size-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-o">
                <div className="border-b border-gray-300 px-4 py-3">
                  <p className="text-xs text-gray-600">Connecté en tant que</p>
                  <p className="truncate text-sm font-medium text-granite-900">{user.email}</p>
                </div>
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-granite-700 transition hover:bg-gray-100"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
