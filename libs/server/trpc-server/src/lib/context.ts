import type { Permission, PermissionSlug } from "@optee/constants";
import { BEARER_TOKEN_PREFIX, PERMISSIONS, UserType } from "@optee/constants";
import { ContactProvider } from "@optee/contact-server";
import type { UserUuid } from "@optee/models";
import { supabase } from "@optee/supabase-server";
import { UserProvider } from "@optee/user-server";
import { isEmailFromOptee } from "@optee/utils";
import type { inferAsyncReturnType } from "@trpc/server";
import type { IncomingMessage } from "http";

export const createContext = async ({ req }: { req: IncomingMessage }) => {
  // GET TRACE
  const traceHeader = req.headers["x-cloud-trace-context"];
  const traceHeaderStr = Array.isArray(traceHeader)
    ? traceHeader[0]
    : traceHeader;

  const traceId = traceHeaderStr?.split("/")?.[0];

  const NULLISH_CONTEXT = {
    user: null,
    isAdmin: false,
    permissions: [] as Permission[],
    permissionsSlugs: [] as PermissionSlug[],
    traceId,
  };

  // GET TOKEN
  const token = req.headers.authorization?.match(
    new RegExp(`${BEARER_TOKEN_PREFIX}\\s+(.+)`),
  )?.[1];

  if (!token) {
    return NULLISH_CONTEXT;
  }

  // GET USER
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return NULLISH_CONTEXT;
  }

  const isAdmin = isEmailFromOptee(user.email);

  const BASIC_CONTEXT = {
    user: {
      id: user.id as UserUuid,
      email: user.email,
      lastSignInAt: user.last_sign_in_at,
      updatedAt: user.updated_at,
    },
    permissions: [] as Permission[],
    permissionsSlugs: [] as PermissionSlug[],
    isAdmin,
    traceId,
  };

  let userTypes: UserType[] = [];
  try {
    // This is a DB call so anything can fail here (any Supabase schema error will be thrown here)
    userTypes = await UserProvider.getUserTypes(BASIC_CONTEXT.user.id);
  } catch (e) {
    console.error("[Context] Erreur getUserTypes", e);
    return BASIC_CONTEXT;
  }

  // Pros don't have roles or permissions
  if (
    userTypes.includes(UserType.PRO) &&
    !userTypes.includes(UserType.CLIENT)
  ) {
    return BASIC_CONTEXT;
  }

  let contactRole = null;
  try {
    contactRole = await ContactProvider.getRoleByUser(BASIC_CONTEXT.user.id);
  } catch (e) {
    console.error("[Context] Erreur getRoleByUser", {
      error: e instanceof Error ? e.message : String(e),
      userId: user.id,
      traceId,
    });
    return BASIC_CONTEXT;
  }

  // When you onboard you don't have a role yet because the contact is created but not linked to a client yet
  if (!contactRole) {
    return BASIC_CONTEXT;
  }

  const permissions = PERMISSIONS.filter((p) =>
    p.roles.some((r) => r === contactRole),
  );

  const permissionsSlugs = permissions.map((p) => p.slug);

  // Give extra permissions to the OPTEE contact
  if (isAdmin) {
    permissionsSlugs.push(
      "INVITE_CLIENT_ADMINISTRATOR",
      "CONTACT_UPDATE_CLIENT_ADMINISTRATOR_RIGHTS",
    );

    const inviteClientAdminPermission = PERMISSIONS.find(
      (p) => p.slug === "INVITE_CLIENT_ADMINISTRATOR",
    );

    if (inviteClientAdminPermission) {
      permissions.push(inviteClientAdminPermission);
    }

    const contactUpdateClientAdminPermission = PERMISSIONS.find(
      (p) => p.slug === "CONTACT_UPDATE_CLIENT_ADMINISTRATOR_RIGHTS",
    );

    if (contactUpdateClientAdminPermission) {
      permissions.push(contactUpdateClientAdminPermission);
    }
  }

  return {
    ...BASIC_CONTEXT,
    permissions,
    permissionsSlugs,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
