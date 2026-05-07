import type { PermissionSlug } from "@optee/constants";
import { ProRepository } from "@optee/pro-server";
import { isEmailFromOptee } from "@optee/utils";
import * as Sentry from "@sentry/node";
import { initTRPC, TRPCError } from "@trpc/server";
import { write as writeLog } from "firebase-functions/logger";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const middleware = t.middleware;

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

const errorMiddleware = middleware(async ({ path, type, next, ctx }) => {
  try {
    // We DO need the await here to make sure the error is caught just below
    return await next();
  } catch (error) {
    // @todo This part is never reached in local environment,
    // console.log("[TRPC ERROR CATCH] Le catch du middleware est atteint", {
    //   path,
    //   type,
    // });

    if (typeof error === "object" && error !== null) {
      // Required if we want to see the error in the GCP console
      const message =
        "message" in error
          ? `[${path}] ${error.message}`
          : `[${path}] Erreur inconnue`;

      logWithTrace(
        message,
        {
          path,
          type,
          code: "code" in error ? error.code : "No code",
        },
        ctx.traceId,
      );
    }

    // @todo Centralize the public-facing message in a shared constant and/or gate detailed messages behind an environment flag with a custom errorFormatter.
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Une erreur interne est survenue. Merci de réessayer plus tard.",
      cause: error,
    });
  }
});

const authMiddleware = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Vous devez être connecté pour accéder à cette ressource.",
    });
  }

  if (!ctx.permissions) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Vous n'avez pas les permissions nécessaires.",
    });
  }

  Sentry.setUser({
    email: ctx.user.email ?? "NA",
    userUuid: ctx.user.id,
    segment: "marketplace_user",
  });

  return next({
    ctx,
  });
});

const adminMiddleware = middleware(({ ctx, next }) => {
  const isAdminOptee = ctx.user?.email
    ? isEmailFromOptee(ctx.user.email)
    : false;

  if (!isAdminOptee) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Seuls les administrateurs Optee peuvent faire ça.",
    });
  }

  return next();
});

const permissionsMiddleware = (requiredPermissions: PermissionSlug[]) =>
  middleware(({ ctx, next }) => {
    const hasSomePermission = requiredPermissions.some((permission) =>
      ctx.permissionsSlugs.includes(permission),
    );

    if (!hasSomePermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `L'utilisateur n'a pas les permissions nécessaires "${requiredPermissions.join(",")}". Si vous pensez que cela est une erreur, veuillez contacter l'administrateur.`,
      });
    }

    return next();
  });

const proWithCreditsMiddleware = (requiredCredit: number) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Utilisateur non authentifié",
      });
    }
    const pro = await ProRepository.getByUser(ctx.user.id);
    if (!pro) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Vous devez être un professionnel pour accéder à cette ressource.",
      });
    }
    const hasCredits = (pro.remainingCredits ?? 0) >= requiredCredit;
    if (!hasCredits) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Vous n'avez pas assez de crédits pour accéder à cette ressource.",
      });
    }

    return next({
      ctx: {
        ...ctx,
        pro: {
          id: pro.uuid,
          name: pro.name,
          subscription: pro.subscription,
          remainingCredits: pro.remainingCredits ?? 0,
        },
      },
    });
  });

// PROCEDURES

export const publicProcedure = t.procedure
  .use(sentryMiddleware)
  .use(errorMiddleware);

export const privateProcedure = t.procedure
  .use(sentryMiddleware)
  .use(authMiddleware)
  .use(errorMiddleware);

export const clientProcedure = (requiredPermissions: PermissionSlug[]) =>
  t.procedure
    .use(sentryMiddleware)
    .use(authMiddleware)
    .use(permissionsMiddleware(requiredPermissions))
    .use(errorMiddleware);

export const adminProcedure = t.procedure
  .use(sentryMiddleware)
  .use(authMiddleware)
  .use(adminMiddleware)
  .use(errorMiddleware);

export const proProcedure = (requiredCredit?: number) =>
  t.procedure
    .use(sentryMiddleware)
    .use(authMiddleware)
    .use(proWithCreditsMiddleware(requiredCredit ?? 0))
    .use(errorMiddleware);

function logWithTrace(
  message: string,
  meta: Record<string, unknown> = {},
  traceId?: string,
) {
  const projectId = process.env["GOOGLE_CLOUD_PROJECT"] ?? "local";

  writeLog({
    severity: "ERROR",
    message,
    projectId,
    ...meta,
    ...(traceId && {
      trace: `projects/${projectId}/traces/${traceId}`,
    }),
  });
}
