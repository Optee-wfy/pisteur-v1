"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

const DPE_COLORS: Record<string, string> = {
  A: "bg-green-700 text-white",
  B: "bg-green-500 text-white",
  C: "bg-cyan-400 text-white",
  D: "bg-yellow-400 text-granite-900",
  E: "bg-amber-400 text-granite-900",
  F: "bg-orange-500 text-white",
  G: "bg-red-500 text-white",
};

export default function PlacesView() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const mutation = trpc.locationsBdnb.getAllPaginatedForPro.useMutation();

  const { data: defaultData, isLoading, error } = trpc.locationsBdnb.getLeadHistoryPaginatedForPro.useQuery(
    { page, pageSize, show: "all" as const },
    { retry: false },
  );

  const items = defaultData?.items ?? [];
  const total = defaultData?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-primary-900">Bâtiments</h1>
        <p className="mt-1 text-sm text-granite-400">
          {total > 0 ? `${total} bâtiment${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}` : "Prospection des bâtiments éligibles"}
        </p>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-16 text-gray-600">
          <svg className="size-5 animate-spin text-primary-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium">Chargement des bâtiments…</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-300 px-5 py-4 text-sm text-red-500">
          <strong>Erreur :</strong> {error.message}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <svg className="mx-auto mb-4 size-12 text-granite-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="font-medium text-granite-700">Aucun bâtiment disponible</p>
          <p className="mt-1 text-sm text-granite-400">
            Configurez vos filtres dans "Paramétrage" pour accéder aux bâtiments éligibles.
          </p>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-granite-400">
                <th className="px-5 py-3">Adresse</th>
                <th className="px-5 py-3">DPE</th>
                <th className="px-5 py-3">Surface</th>
                <th className="px-5 py-3">Logements</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const loc = item.location;
                const dpe = (loc as { dpeLabel?: string }).dpeLabel;
                const surface = (loc as { surfaceThatRequiresHeating?: number | null }).surfaceThatRequiresHeating;
                const nbUnits = (loc as { nbUnits?: number | null }).nbUnits;

                return (
                  <tr key={loc.uuid} className="group hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="font-medium text-granite-900 line-clamp-1">
                        {loc.name ?? loc.address ?? "Adresse inconnue"}
                      </div>
                      {loc.zipcode && (
                        <div className="text-xs text-granite-400">{loc.zipcode} {loc.city}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {dpe ? (
                        <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${DPE_COLORS[dpe] ?? "bg-granite-100 text-granite-700"}`}>
                          {dpe}
                        </span>
                      ) : (
                        <span className="text-granite-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-granite-700">
                      {surface ? `${surface.toLocaleString("fr-FR")} m²` : "—"}
                    </td>
                    <td className="px-5 py-4 text-granite-700">
                      {nbUnits ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`/pisteur/places/${loc.uuid}`}
                        className="rounded-lg bg-primary-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-800"
                      >
                        Voir
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <span className="text-xs text-granite-400">Page {page + 1} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-granite-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-granite-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
