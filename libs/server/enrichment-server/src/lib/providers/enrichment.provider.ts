import type { FullEnrichEnrichmentId } from "@optee/constants";
import { FullEnrichEnrichmentStatus } from "@optee/constants";
import { EnrichmentRepository } from "../repositories/enrichment.repository";

const resolveStatus = async (
  enrichmentId: FullEnrichEnrichmentId,
  visited: Set<FullEnrichEnrichmentId> = new Set(),
): Promise<FullEnrichEnrichmentStatus> => {
  if (visited.has(enrichmentId)) {
    // Dépendance cyclique détectée : on retourne un statut neutre,
    console.warn(
      "[Enrichment] Cycle détecté dans la dépendance d'enrichissements",
      { enrichmentId },
    );
    return FullEnrichEnrichmentStatus.UNKNOWN;
  }

  const nextVisited = new Set(visited);
  nextVisited.add(enrichmentId);

  const res = await EnrichmentRepository.get(enrichmentId);
  if (!res) {
    return FullEnrichEnrichmentStatus.UNKNOWN;
  }

  // Si l'enrichissement courant est déjà IN_PROGRESS, on peut court‑circuiter
  if (res.status === FullEnrichEnrichmentStatus.IN_PROGRESS) {
    return FullEnrichEnrichmentStatus.IN_PROGRESS;
  }

  const dependsOnStatuses = await Promise.all(
    res.dependsOn?.map((dependEnrichmentId) =>
      resolveStatus(dependEnrichmentId as FullEnrichEnrichmentId, nextVisited),
    ) ?? [],
  );

  return [...dependsOnStatuses, res.status].some(
    (status) => status === FullEnrichEnrichmentStatus.IN_PROGRESS,
  )
    ? FullEnrichEnrichmentStatus.IN_PROGRESS
    : res.status;
};

export const EnrichmentProvider = {
  getStatus(
    enrichmentId: FullEnrichEnrichmentId,
  ): Promise<FullEnrichEnrichmentStatus> {
    return resolveStatus(enrichmentId);
  },
};
