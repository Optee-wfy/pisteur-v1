import z from "zod";
import type { LocationBdnbLegalEntityFilterProSort } from "./location-bdnb-legal-entity-filters.constant";
import { locationLegalEntitySortFields } from "./location-bdnb-legal-entity-filters.constant";

export type PaginationState = {
  page: number;
  pageSize: number;
  sort: LocationBdnbLegalEntityFilterProSort | null;
};

export const paginationSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).default(50),
  sort: z
    .object({
      sortBy: z.enum(locationLegalEntitySortFields),
      sortOrder: z.enum(["asc", "desc"]),
    })
    .nullable()
    .default(null),
});

export const defaultPagination: PaginationState = {
  page: 0,
  pageSize: 50,
  sort: null,
};
