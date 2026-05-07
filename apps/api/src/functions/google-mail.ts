import { BEARER_TOKEN_PREFIX } from "@optee/constants";
import { GoogleMailProvider } from "@optee/mail-integration-server";
import type { UserUuid } from "@optee/models";
import { supabase } from "@optee/supabase-server";
import type { Request, Response } from "express";
import { z } from "zod";

const connectBodySchema = z.object({
  mode: z.enum(["json", "redirect"]).optional().default("json"),
});

const getAuthenticatedUserUuid = async (req: Request) => {
  const token = req.headers.authorization?.match(
    new RegExp(`${BEARER_TOKEN_PREFIX}\\s+(.+)`),
  )?.[1];

  if (!token) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return (user?.id as UserUuid | undefined) ?? null;
};

export const googleMailConnectController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userUuid = await getAuthenticatedUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const parsedBody = connectBodySchema.safeParse(req.body ?? {});

    if (!parsedBody.success) {
      return res.status(400).json({
        error: "Invalid request body",
      });
    }

    const authorizationUrl =
      GoogleMailProvider.createAuthorizationUrl(userUuid);

    if (parsedBody.data.mode === "redirect") {
      return res.redirect(302, authorizationUrl);
    }

    return res.json({
      authorizationUrl,
    });
  } catch (error) {
    console.error("[GoogleMail] Failed to start OAuth flow", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const googleMailCallbackController = async (
  req: Request,
  res: Response,
) => {
  const querySchema = z.object({
    code: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    error: z.string().min(1).optional(),
    error_description: z.string().optional(),
  });

  const parsedQuery = querySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).send("Invalid Google callback parameters");
  }

  if (parsedQuery.data.error) {
    const message =
      parsedQuery.data.error_description ?? parsedQuery.data.error;
    const payload = JSON.stringify({
      source: "google-gmail-oauth",
      status: "error",
      message,
    }).replace(/</g, "\\u003c");

    console.error("[GoogleMail] Callback returned an error", message);

    return res
      .status(400)
      .type("html")
      .send(
        `<!doctype html><script>window.opener?.postMessage(${payload}, "*");</script>`,
      );
  }

  if (!parsedQuery.data.code || !parsedQuery.data.state) {
    return res.status(400).send("Missing Google callback parameters");
  }

  try {
    const result = await GoogleMailProvider.handleCallback({
      code: parsedQuery.data.code,
      state: parsedQuery.data.state,
    });
    const payload = JSON.stringify({
      source: "google-gmail-oauth",
      status: "success",
      connection: result,
    }).replace(/</g, "\\u003c");

    return res
      .status(200)
      .type("html")
      .send(
        `<!doctype html><script>window.opener?.postMessage(${payload}, "*");window.close();</script>`,
      );
  } catch (error) {
    console.error("[GoogleMail] Callback handling failed", error);
    const payload = JSON.stringify({
      source: "google-gmail-oauth",
      status: "error",
      message:
        error instanceof Error ? error.message : "Google OAuth callback failed",
    }).replace(/</g, "\\u003c");

    return res
      .status(400)
      .type("html")
      .send(
        `<!doctype html><script>window.opener?.postMessage(${payload}, "*");</script>`,
      );
  }
};

export const googleMailStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userUuid = await getAuthenticatedUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const connection = await GoogleMailProvider.getConnectionStatus(userUuid);

    return res.json({
      connected: Boolean(connection),
      connection,
    });
  } catch (error) {
    console.error("[GoogleMail] Failed to fetch connection status", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const googleMailDisconnectController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userUuid = await getAuthenticatedUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const deleted = await GoogleMailProvider.disconnect(userUuid);

    return res.json({
      disconnected: Boolean(deleted),
    });
  } catch (error) {
    console.error("[GoogleMail] Failed to disconnect Gmail mailbox", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const googleMailSendTestController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userUuid = await getAuthenticatedUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const result = await GoogleMailProvider.sendTestEmail(userUuid);

    return res.json({
      sent: true,
      sentTo: result.sentTo,
    });
  } catch (error) {
    console.error("[GoogleMail] Failed to send test email", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
