export type OwnerName =
  | {
      firstName: string | null;
      lastName: string | null;
    }
  | null
  | undefined;

export function formatNameInitials(owner: OwnerName): string {
  if (!owner) {
    return "--";
  }
  const firstInitial = owner.firstName?.charAt(0)?.toUpperCase() ?? "-";
  const lastInitial = owner.lastName?.charAt(0)?.toUpperCase() ?? "-";
  return firstInitial + lastInitial;
}

export function formatFullName(owner: OwnerName): string | undefined {
  if (!owner) {
    return undefined;
  }
  const firstName = owner.firstName ?? "";
  const lastName = owner.lastName ?? "";
  if (!firstName && !lastName) {
    return undefined;
  }
  return `${firstName} ${lastName}`.trim();
}
