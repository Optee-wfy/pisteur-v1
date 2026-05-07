const ZONE_SEPARATOR = ";";

export const formatProValueToString = (value: string[]) =>
  value.join(ZONE_SEPARATOR);

export const formatProValueToArray = (value: string) =>
  value.split(ZONE_SEPARATOR);
