import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import type { ProUuid } from "@optee/models";
import { stableStringify } from "./stable-stringify.function";

export const buildScopedCacheKey = (
  scope: string,
  proUuid: ProUuid,
  filters: LocationsBdnbLegalEntityProListInput,
) =>
  stableStringify({
    scope,
    proUuid,
    filters,
  });
