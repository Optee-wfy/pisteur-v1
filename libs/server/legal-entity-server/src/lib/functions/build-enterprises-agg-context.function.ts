import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import { LocationBdnbLegalEntityRepository } from "@optee/location-bdnb-legal-entity-server";
import type { ProUuid } from "@optee/models";
import type { db } from "@optee/supabase-server";
import { buildBaseFilters } from "./build-base-filters.function";
import { buildEnterprisesAggWithLocationFilters } from "./build-enterprises-agg-with-location-filters.function";
import { buildEnterprisesAggWithoutLocationFilters } from "./build-enterprises-agg-without-location-filters.function";
import { buildHasLocationFilters } from "./build-has-location-filters.function";
import { buildNbRelatedLocationsExpr } from "./build-nb-related-locations-expr.function";
import { buildNbRelatedLocationsWhere } from "./build-nb-related-locations-where.function";
import { buildSortableColumnMap } from "./build-sortable-column-map.function";

/**
 * Build aggregation CTEs + sorting context for paginated legal entity queries.
 */
export const buildEnterprisesAggContext = ({
  filters,
  proUuid,
}: {
  filters: LocationsBdnbLegalEntityProListInput;
  proUuid: ProUuid;
}) => {
  const baseFilters = buildBaseFilters(filters);
  const { locationFilters, showFilter: locationShowFilter } =
    LocationBdnbLegalEntityRepository.buildLocationFiltersSQL({
      filters: baseFilters,
    });

  const base = LocationBdnbLegalEntityRepository.buildBaseScopeCTE({
    filters: baseFilters,
    proUuid,
    forceAssociationJoin: true,
  });

  const [minRelated, maxRelated] = baseFilters.nbRelatedLocations ?? [
    null,
    null,
  ];
  const nbRelatedLocationsExpr = buildNbRelatedLocationsExpr();
  const whereNbRelated = buildNbRelatedLocationsWhere(
    nbRelatedLocationsExpr,
    minRelated,
    maxRelated,
  );

  const show = filters.show ?? "all";
  const hasLocationFilters = buildHasLocationFilters(
    baseFilters,
    locationFilters,
    locationShowFilter,
  );
  const enterprisesAgg = hasLocationFilters
    ? buildEnterprisesAggWithLocationFilters({
        base,
        proUuid,
        show,
        nbRelatedLocationsExpr,
        whereNbRelated,
      })
    : buildEnterprisesAggWithoutLocationFilters({
        filters: baseFilters,
        proUuid,
        show,
        nbRelatedLocationsExpr,
        whereNbRelated,
      });

  const sortableColumnMap = buildSortableColumnMap(enterprisesAgg);
  const sortColumn =
    (baseFilters.sort?.sortBy &&
      sortableColumnMap[
        baseFilters.sort.sortBy as keyof typeof sortableColumnMap
      ]) ??
    enterprisesAgg.nbRelatedLocations;

  const withCtes = (
    hasLocationFilters ? [base, enterprisesAgg] : [enterprisesAgg]
  ) as Parameters<typeof db.with>;

  return {
    enterprisesAgg,
    sortColumn,
    withCtes,
  };
};
