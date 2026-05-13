"use client";

import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";

const SECTOR_LABELS: Record<string, string> = {
  RES: "Résidentiel",
  TERTI: "Tertiaire",
  INDUS: "Industrie",
};

const DPE_COLORS: Record<string, string> = {
  A: "bg-green-700 text-white",
  B: "bg-green-600 text-white",
  C: "bg-cyan-500 text-white",
  D: "bg-yellow-400 text-granite-900",
  E: "bg-amber-400 text-granite-900",
  F: "bg-orange-500 text-white",
  G: "bg-red-500 text-white",
};

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

export default function LeadsView() {
  const { data: leads, isLoading, error } = trpc.operations.getAllCompatibleWithPro.useQuery();

  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");

  const phaseOptions = useMemo(() => {
    if (!leads) return [];
    const phases = [...new Set(leads.map((l) => l.phase?.enum).filter(Boolean))];
    return phases;
  }, [leads]);

  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => {
      const matchSearch =
        !search ||
        lead.typeInfo?.label?.toLowerCase().includes(search.toLowerCase()) ||
        (lead.name ?? "").toLowerCase().includes(search.toLowerCase());

      const matchPhase = phaseFilter === "all" || lead.phase?.enum === phaseFilter;

      return matchSearch && matchPhase;
    });
  }, [leads, search, phaseFilter]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-primary-900">
          Appels d'offres disponibles
        </h1>
        <p className="text-sm text-gray-600">
          Explorez les projets ouverts à la consultation et positionnez-vous sur les opérations compatibles avec vos prestations.
        </p>
      </header>

      <div className="rounded-2xl bg-white p-6 shadow-o">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Rechercher une opération ou une adresse…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 md:w-64"
          >
            <option value="all">Toutes les phases</option>
            {phaseOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-granite-900">{filtered.length}</span>
          <span>opération{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}</span>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-600">
            <svg className="size-5 animate-spin text-primary-700" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium">Chargement des opportunités…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-300 px-5 py-4 text-sm text-red-500">
            <strong>Erreur de chargement :</strong> {error.message}
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="rounded-xl bg-primary-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-primary-700">
              🔍 Aucune opération disponible pour le moment.
            </p>
            <p className="mt-1 text-xs text-gray-600">
              De nouvelles opportunités arrivent régulièrement. Revenez bientôt.
            </p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <th className="pb-3 pr-4">Opération</th>
                  <th className="pb-3 pr-4">Phase</th>
                  <th className="pb-3 pr-4">Budget</th>
                  <th className="pb-3 pr-4">Secteur</th>
                  <th className="pb-3 pr-4">DPE</th>
                  <th className="pb-3 pr-4">Publié le</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((lead) => (
                  <LeadRow key={lead.uuid} lead={lead} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LeadRow({ lead }: { lead: any }) {
  const sector = (lead as { sortableSector?: string }).sortableSector;
  const dpe = (lead as { dpeLabel?: string }).dpeLabel;

  return (
    <tr className="group transition hover:bg-gray-100">
      <td className="py-4 pr-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-granite-900">
            {lead.typeInfo?.label ?? "—"}
          </span>
          {lead.name && (
            <span className="text-xs text-gray-600 line-clamp-1">{lead.name}</span>
          )}
        </div>
      </td>

      <td className="py-4 pr-4">
        <PhaseBadge phase={lead.phase?.enum} />
      </td>

      <td className="py-4 pr-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-granite-900">
            {formatCurrency((lead as { cost?: { value?: number | null } }).cost?.value)}
          </span>
          {(lead as { cost?: { isEstimated?: boolean } }).cost?.isEstimated && (
            <span className="text-xs text-gray-600">Estimation</span>
          )}
        </div>
      </td>

      <td className="py-4 pr-4">
        <span className="text-granite-700">
          {sector ? (SECTOR_LABELS[sector] ?? sector) : "—"}
        </span>
      </td>

      <td className="py-4 pr-4">
        {dpe ? (
          <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${DPE_COLORS[dpe] ?? "bg-granite-100 text-granite-700"}`}>
            {dpe}
          </span>
        ) : (
          <span className="text-gray-600">—</span>
        )}
      </td>

      <td className="py-4 pr-4 text-granite-700">
        {formatDate((lead as { createdAt?: Date | string | null }).createdAt)}
      </td>

      <td className="py-4">
        <a
          href={`/leads/${lead.uuid}`}
          className="rounded-lg bg-primary-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-800 group-hover:opacity-100"
        >
          Voir le lead
        </a>
      </td>
    </tr>
  );
}

function PhaseBadge({ phase }: { phase?: string }) {
  if (!phase) return <span className="text-gray-600">—</span>;

  const colors: Record<string, string> = {
    MARKETPLACE: "bg-green-100 text-green-700",
    PROJECT_PHASE: "bg-primary-100 text-primary-700",
    SIGNED: "bg-granite-100 text-granite-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colors[phase] ?? "bg-granite-100 text-granite-700"}`}>
      {phase}
    </span>
  );
}
