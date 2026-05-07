import { inject, makeStateKey, TransferState } from "@angular/core";
import type { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import type { UseCase } from "@optee/blog";
import { trpcClient } from "../../trpc-client";

// Clés pour TransferState
const USE_CASES_KEY = makeStateKey<UseCase[]>("use-cases");
const USE_CASE_DETAIL_KEY = (slug: string) =>
  makeStateKey<{
    detail: UseCase | null;
    relatedUseCases: UseCase[];
  }>(`use-case-${slug}`);

/**
 * Resolver pour récupérer tous les use cases
 * Utilise TransferState pour éviter les re-fetch côté client
 */
export const useCasesResolver: ResolveFn<UseCase[]> = async () => {
  const transferState = inject(TransferState);

  // Vérifier si les données sont déjà en cache
  if (transferState.hasKey(USE_CASES_KEY)) {
    return transferState.get(USE_CASES_KEY, []);
  }

  const useCases = await trpcClient.useCase.getAll.query({
    limit: undefined,
  });
  transferState.set(USE_CASES_KEY, useCases);
  return useCases;
};

/**
 * Resolver pour récupérer un use case spécifique par slug
 * Utilise TransferState pour éviter les re-fetch côté client
 */
export const useCasePageResolver: ResolveFn<{
  detail: UseCase | null;
  relatedUseCases: UseCase[];
}> = async (route: ActivatedRouteSnapshot) => {
  const transferState = inject(TransferState);
  const slug = route.paramMap.get("slug");

  if (!slug) {
    return { detail: null, relatedUseCases: [] };
  }

  const stateKey = USE_CASE_DETAIL_KEY(slug);

  // Vérifier si les données sont déjà en cache
  if (transferState.hasKey(stateKey)) {
    return transferState.get(stateKey, { detail: null, relatedUseCases: [] });
  }

  const useCase = await trpcClient.useCase.getBySlug.query(slug);
  if (!useCase?.relatedUseCaseIds?.length) {
    const result = { detail: useCase, relatedUseCases: [] };
    transferState.set(stateKey, result);
    return result;
  }

  const relatedUseCases = await trpcClient.useCase.getRelatedEntries.query(
    useCase.relatedUseCaseIds,
  );

  const result = { detail: useCase, relatedUseCases };
  transferState.set(stateKey, result);
  return result;
};
