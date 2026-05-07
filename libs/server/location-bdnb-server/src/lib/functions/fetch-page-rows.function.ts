import type { buildLockedQuery } from "./build-locked-query.function";
import type { buildUnlockedQuery } from "./build-unlocked-query.function";

/**
 * Combines unlocked + locked paging so unlocked entries always appear first.
 */
export const fetchPageRows = async ({
  unlockedQuery,
  lockedQuery,
  offset,
  pageSize,
  unlockedCount,
}: {
  unlockedQuery: ReturnType<typeof buildUnlockedQuery>;
  lockedQuery: ReturnType<typeof buildLockedQuery>;
  offset: number;
  pageSize: number;
  unlockedCount: number;
}) => {
  if (offset < unlockedCount) {
    const unlockedRows = await unlockedQuery.limit(pageSize).offset(offset);
    const remaining = pageSize - unlockedRows.length;
    if (remaining > 0) {
      const lockedRows = await lockedQuery.limit(remaining).offset(0);
      return [...unlockedRows, ...lockedRows];
    }
    return unlockedRows;
  }

  const lockedOffset = offset - unlockedCount;
  return lockedQuery.limit(pageSize).offset(lockedOffset);
};
