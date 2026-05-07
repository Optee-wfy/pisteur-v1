/**
 * Remove duplicates from an array of objects (based on uuid value)
 * @param array to remove duplicates from
 * @returns array without duplicates
 */
export function removeDuplicate<T extends { uuid: string }>(array: T[]): T[] {
  return array.filter(
    (obj, index, self) => index === self.findIndex((o) => o.uuid === obj.uuid),
  );
}
