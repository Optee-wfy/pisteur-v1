"use client";

import { trpc } from "@/lib/trpc";
import { FRENCH_DEPARTMENTS, type BuildingUsage, type Department } from "@optee/constants";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const BUILDING_USAGE_OPTIONS: { value: BuildingUsage; label: string }[] = [
  { value: "residential", label: "Résidentiel" },
  { value: "tertiary", label: "Tertiaire" },
  { value: "industrial", label: "Industrie" },
  { value: "other", label: "Autre" },
];

const DPE_OPTIONS = ["A", "B", "C", "D", "E", "F", "G"] as const;
type DpeLabel = (typeof DPE_OPTIONS)[number];

function formatNumber(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR").format(n);
}

export default function GenerateLeadsView() {
  const router = useRouter();
  const [buildingUsage, setBuildingUsage] = useState<BuildingUsage[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dpe, setDpe] = useState<DpeLabel[]>([]);
  const [launching, setLaunching] = useState(false);

  const filters = useMemo(() => ({
    buildingUsage: buildingUsage.length > 0 ? buildingUsage : null,
    locationDepartment: departments.length > 0 ? departments : null,
    dpe: dpe.length > 0 ? dpe : null,
    show: "new" as const,
  }), [buildingUsage, departments, dpe]);

  const hasFilters = buildingUsage.length > 0 || departments.length > 0 || dpe.length > 0;

  const countMutation = trpc.locationsBdnb.countMatchingLocations.useMutation();
  const { data: leadHistory } = trpc.locationsBdnb.getLeadHistoryPaginatedForPro.useQuery(
    { page: 0, pageSize: 1 },
    { retry: false },
  );

  const buildingCount = countMutation.data?.buildingCount ?? null;
  const companyCount = countMutation.data?.companyCount ?? null;
  const unlockedLeadsCount = leadHistory?.total ?? 0;

  function handleCountRefresh() {
    if (hasFilters) {
      countMutation.mutate(filters as Parameters<typeof countMutation.mutate>[0]);
    }
  }

  async function handleLaunch() {
    if (!hasFilters) return;
    setLaunching(true);
    try {
      router.push("/pisteur/places");
    } finally {
      setLaunching(false);
    }
  }

  function toggleBuildingUsage(value: BuildingUsage) {
    setBuildingUsage((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function toggleDpe(value: DpeLabel) {
    setDpe((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function toggleDepartment(value: Department) {
    setDepartments((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  return (
    <div className="flex w-full max-h-full overflow-y-auto flex-col px-4 pb-8 pt-0 lg:px-8">
      {/* STATS CARDS */}
      <section className="sticky top-0 isolate z-20 grid gap-3 pt-3 pb-3 backdrop-blur-sm xl:grid-cols-3">
        <StatCard
          color="blue"
          icon={<IconBuilding />}
          title="Bâtiments correspondants"
          value={countMutation.isPending ? null : buildingCount}
          subtitle="Basé sur vos filtres actuels"
        />
        <StatCard
          color="purple"
          icon={<IconCompany />}
          title="Entreprises correspondantes"
          value={countMutation.isPending ? null : companyCount}
          subtitle="Gestionnaires potentiels"
        />
        <StatCard
          color="green"
          icon={<IconCrosshair />}
          title="Leads déjà obtenus"
          value={unlockedLeadsCount}
          subtitle="Dans votre CRM"
        />
      </section>

      {/* INTRO BANNER */}
      <section className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-3 shadow-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">Première visite ?</h3>
              <p className="text-xs text-blue-100">
                Découvrez comment générer vos premiers leads en 2 minutes
              </p>
            </div>
          </div>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-blue-50"
            href="https://optee.io/demo"
            rel="noreferrer"
            target="_blank"
          >
            Demander une démo
          </a>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* FILTERS */}
        <div className="flex flex-col gap-8">
          {/* Type de bâtiment */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-green-100">
                <IconCrosshair className="size-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-primary-900 md:text-[1.2rem]">
                  Définition de vos cibles marketing
                </h2>
                <p className="mt-1 text-sm text-granite-400">
                  Affinez vos critères de ciblage pour obtenir les leads les plus pertinents
                </p>
              </div>
            </div>
            <hr className="mb-5 border-slate-200" />

            <div className="flex flex-col gap-5">
              <div>
                <h3 className="mb-1 text-base font-semibold text-primary-900">Type de bâtiment</h3>
                <p className="mb-3 text-sm text-granite-400">Sélectionnez un ou plusieurs types de bâtiments</p>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_USAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleBuildingUsage(opt.value)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                        buildingUsage.includes(opt.value)
                          ? "border-primary-500 bg-primary-100 text-primary-700"
                          : "border-slate-200 bg-white text-granite-700 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-base font-semibold text-primary-900">DPE</h3>
                <p className="mb-3 text-sm text-granite-400">Filtrer par classe énergétique</p>
                <div className="flex flex-wrap gap-2">
                  {DPE_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDpe(d)}
                      className={`flex size-9 items-center justify-center rounded-lg border text-sm font-bold transition ${
                        dpe.includes(d)
                          ? "border-primary-500 bg-primary-600 text-white"
                          : "border-slate-200 bg-white text-granite-700 hover:bg-slate-50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Localisation */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
                <svg className="size-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-primary-900 md:text-[1.2rem]">
                  Localisation
                </h2>
                <p className="mt-1 text-sm text-granite-400">
                  Sélectionnez les départements à cibler
                </p>
              </div>
            </div>
            <hr className="mb-5 border-slate-200" />

            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200">
              {FRENCH_DEPARTMENTS.map((dept) => (
                <label
                  key={dept}
                  className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-slate-50 ${
                    departments.includes(dept) ? "bg-primary-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={departments.includes(dept)}
                    onChange={() => toggleDepartment(dept)}
                    className="size-4 accent-primary-600"
                  />
                  <span className={departments.includes(dept) ? "font-medium text-primary-700" : "text-granite-700"}>
                    {dept}
                  </span>
                </label>
              ))}
            </div>
            {departments.length > 0 && (
              <p className="mt-2 text-xs text-granite-400">
                {departments.length} département{departments.length > 1 ? "s" : ""} sélectionné{departments.length > 1 ? "s" : ""}
              </p>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-granite-700">Aperçu des résultats</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                <span className="text-sm text-blue-700">Bâtiments</span>
                <span className="text-lg font-bold text-blue-900">
                  {countMutation.isPending ? (
                    <span className="inline-block h-5 w-16 animate-pulse rounded bg-blue-200" />
                  ) : buildingCount != null ? (
                    formatNumber(buildingCount)
                  ) : (
                    <span className="text-sm text-blue-400">—</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-purple-50 px-4 py-3">
                <span className="text-sm text-purple-700">Entreprises</span>
                <span className="text-lg font-bold text-purple-900">
                  {countMutation.isPending ? (
                    <span className="inline-block h-5 w-16 animate-pulse rounded bg-purple-200" />
                  ) : companyCount != null ? (
                    formatNumber(companyCount)
                  ) : (
                    <span className="text-sm text-purple-400">—</span>
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={handleCountRefresh}
              disabled={!hasFilters || countMutation.isPending}
              className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-granite-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {countMutation.isPending ? "Calcul en cours…" : "Actualiser le comptage"}
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/pisteur/places")}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-granite-700 transition hover:bg-slate-50"
            >
              Voir les bâtiments disponibles
            </button>

            <button
              onClick={handleLaunch}
              disabled={launching}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:opacity-50"
            >
              {launching ? "Navigation…" : "Lancer la génération de leads"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  color,
  icon,
  title,
  value,
  subtitle,
}: {
  color: "blue" | "purple" | "green";
  icon: React.ReactNode;
  title: string;
  value: number | null;
  subtitle: string;
}) {
  const colors = {
    blue: {
      border: "border-blue-200",
      bg: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-600",
      titleColor: "text-blue-700",
      valueColor: "text-blue-900",
      subtitleColor: "text-blue-700",
    },
    purple: {
      border: "border-purple-200",
      bg: "from-purple-50 to-fuchsia-50",
      iconBg: "bg-purple-600",
      titleColor: "text-purple-700",
      valueColor: "text-purple-900",
      subtitleColor: "text-purple-700",
    },
    green: {
      border: "border-green-200",
      bg: "from-green-50 to-emerald-50",
      iconBg: "bg-green-600",
      titleColor: "text-green-700",
      valueColor: "text-green-900",
      subtitleColor: "text-green-700",
    },
  }[color];

  return (
    <article className={`rounded-[1.4rem] border-2 ${colors.border} bg-gradient-to-br ${colors.bg} p-4 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colors.iconBg} shadow-md`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${colors.titleColor}`}>{title}</p>
          <p className={`text-3xl font-bold ${colors.valueColor}`}>
            {value == null ? (
              <span className="inline-block h-9 w-20 animate-pulse rounded bg-current opacity-10" />
            ) : (
              formatNumber(value)
            )}
          </p>
          <p className={`mt-0.5 text-xs ${colors.subtitleColor}`}>{subtitle}</p>
        </div>
      </div>
    </article>
  );
}

function IconBuilding({ className = "size-6 text-white" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function IconCompany({ className = "size-6 text-white" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconCrosshair({ className = "size-6 text-white" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 0v4m0 8h.01M8.5 8.5l7 7m0-7l-7 7" />
    </svg>
  );
}
