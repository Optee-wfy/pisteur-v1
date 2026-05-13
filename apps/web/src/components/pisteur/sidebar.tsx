"use client";

import LoadingRadar from "@/components/ui/loading-radar";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

function NavItem({
  href,
  icon,
  children,
  exact = false,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex min-h-11 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        isActive ? "bg-granite-100" : "text-granite-900 hover:bg-granite-100"
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}

export default function PisteurSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(true);

  const { data: pro } = trpc.pros.getByLoggedPro.useQuery(undefined, {
    retry: false,
  });
  const { data: contact } = trpc.contacts.getByLoggedUser.useQuery();

  const isParametrageActive = pathname.startsWith("/pisteur/leads");
  const remainingCredits = pro?.remainingCredits ?? 0;

  const initial = contact?.firstName?.[0]?.toUpperCase() ?? contact?.email?.[0]?.toUpperCase() ?? "U";
  const displayName =
    [contact?.firstName, contact?.lastName].filter(Boolean).join(" ") ||
    contact?.email ||
    "Utilisateur";

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="flex h-full flex-col justify-between border-r border-granite-100 bg-white px-3 pb-3 pt-5"
      style={{ width: "var(--pisteur-sidebar-width, 220px)" }}
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex flex-col gap-2">
        {/* HEADER */}
        <header className="mb-3 flex w-fit items-center gap-2.5 px-1">
          <LoadingRadar size={26} />
          <span className="font-display text-xl font-bold text-primary-700">optee</span>
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">pisteur</span>
        </header>

        <hr className="my-2 border-granite-200" />

        {/* MOTEUR DE RECHERCHE (accordion) */}
        <div className="mb-1">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            className="flex w-full items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-wide text-granite-500 xl:text-sm"
          >
            <svg
              className={`size-3 transition-transform ${searchOpen ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="whitespace-nowrap">Moteur de recherche</span>
          </button>

          {searchOpen && (
            <div className="mt-1 flex flex-col gap-4 pl-2">
              {/* Prospection avancée */}
              <div>
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-granite-400">
                  Prospection avancée
                </p>
                <menu className="flex flex-col gap-y-1">
                  <li>
                    <NavItem href="/pisteur/places" icon={<IconBuilding />}>
                      Bâtiments
                    </NavItem>
                  </li>
                  <li>
                    <NavItem href="/pisteur/legal-entities" icon={<IconCompany />}>
                      Entreprises
                    </NavItem>
                  </li>
                </menu>
              </div>

              {/* Carnet d'adresse */}
              <div>
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-granite-400">
                  Carnet d'adresse
                </p>
                <menu className="flex flex-col gap-y-1">
                  <li>
                    <NavItem href="/pisteur/address-book/places" icon={<IconBuilding />}>
                      Bâtiments
                    </NavItem>
                  </li>
                  <li>
                    <NavItem href="/pisteur/address-book/legal-entities" icon={<IconCompany />}>
                      Entreprises
                    </NavItem>
                  </li>
                </menu>
              </div>
            </div>
          )}
        </div>

        {/* MES LEADS */}
        <NavItem
          href="/pisteur/address-book/leads"
          icon={<svg className="size-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        >
          Mes Leads
        </NavItem>

        {/* MES CONTACTS */}
        <NavItem
          href="/pisteur/address-book/contacts"
          icon={<svg className="size-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        >
          Mes Contacts
        </NavItem>

        <hr className="my-2 border-granite-200" />

        {/* ASSISTANT IA (coming soon) */}
        <div className="cursor-default opacity-60" title="Bientôt disponible">
          <button
            disabled
            className="flex w-full items-center gap-2 rounded-xl bg-granite-100 px-4 py-3 text-sm font-medium text-granite-800"
          >
            <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Ouvrir l'Assistant IA</span>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="flex flex-col gap-1">
        <div className="border-y border-granite-200 py-1">
          <Link
            href="/pisteur/leads"
            className={`flex min-h-11 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              isParametrageActive
                ? "bg-green-600 text-white"
                : "text-granite-900 hover:bg-granite-100"
            }`}
          >
            <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 0v4m0 8h.01M8.5 8.5l7 7m0-7l-7 7" />
            </svg>
            Paramétrage
          </Link>
        </div>

        {/* CREDITS CARD */}
        <div className="mt-1.5 flex flex-col gap-1 rounded-xl border border-blue-100 bg-blue-50 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-500">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Crédits</span>
          </div>
          <span className="text-2xl font-bold leading-none text-blue-700">
            {remainingCredits}
          </span>
          <span className="text-xs text-granite-400">
            1 liste de leads = 10 crédits
          </span>
        </div>

        {/* USER ROW */}
        <div className="mt-0.5 flex w-full items-center gap-1">
          <div className="flex flex-1 shrink-0 min-h-11 cursor-default items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-granite-900">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-black text-[8px] text-white">
              {initial}
            </span>
            <span className="line-clamp-1 max-w-full text-sm">{displayName}</span>
          </div>
          <button
            onClick={signOut}
            className="size-9 cursor-pointer rounded-lg p-2 text-granite-400 transition-colors hover:bg-red-300 hover:text-red-500"
            aria-label="Se déconnecter"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </footer>
    </aside>
  );
}

function IconBuilding() {
  return (
    <svg className="size-4 text-granite-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function IconCompany() {
  return (
    <svg className="size-4 text-granite-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
