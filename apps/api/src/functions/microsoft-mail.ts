import { BEARER_TOKEN_PREFIX } from "@optee/constants";
import { MicrosoftMailProvider } from "@optee/mail-integration-server";
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

export const microsoftMailConnectController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userUuid = await getAuthenticatedUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsedBody = connectBodySchema.safeParse(req.body ?? {});

    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const authorizationUrl =
      MicrosoftMailProvider.createAuthorizationUrl(userUuid);

    if (parsedBody.data.mode === "redirect") {
      return res.redirect(302, authorizationUrl);
    }

    return res.json({ authorizationUrl });
  } catch (error) {
    console.error("[MicrosoftMail] Failed to start OAuth flow", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const microsoftMailCallbackController = async (
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
    return res.status(400).send("Invalid Microsoft callback parameters");
  }

  if (parsedQuery.data.error) {
    const message =
      parsedQuery.data.error_description ?? parsedQuery.data.error;
    const payload = JSON.stringify({
      source: "microsoft-mail-oauth",
      status: "error",
      message,
    }).replace(/</g, "\\u003c");

    console.error("[MicrosoftMail] Callback returned an error", message);

    return res
      .status(400)
      .type("html")
      .send(
        `<!doctype html><script>window.opener?.postMessage(${payload}, "*");</script>`,
      );
  }

  if (!parsedQuery.data.code || !parsedQuery.data.state) {
    return res.status(400).send("Missing Microsoft callback parameters");
  }

  try {
    const result = await MicrosoftMailProvider.handleCallback({
      code: parsedQuery.data.code,
      state: parsedQuery.data.state,
    });
    const payload = JSON.stringify({
      source: "microsoft-mail-oauth",
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
    console.error("[MicrosoftMail] Callback handling failed", error);
    const payload = JSON.stringify({
      source: "microsoft-mail-oauth",
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Microsoft OAuth callback failed",
    }).replace(/</g, "\\u003c");

    return res
      .status(400)
      .type("html")
      .send(
        `<!doctype html><script>window.opener?.postMessage(${payload}, "*");</script>`,
      );
  }
};

export const microsoftMailStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userUuid = await getAuthenticatedUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const connection =
      await MicrosoftMailProvider.getConnectionStatus(userUuid);

    return res.json({
      connected: Boolean(connection),
      connection,
    });
  } catch (error) {
    console.error("[MicrosoftMail] Failed to fetch connection status", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const microsoftMailDisconnectController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userUuid = await getAuthenticatedUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const deleted = await MicrosoftMailProvider.disconnect(userUuid);

    return res.json({
      disconnected: Boolean(deleted),
    });
  } catch (error) {
    console.error(
      "[MicrosoftMail] Failed to disconnect Microsoft mailbox",
      error,
    );
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const microsoftMailSendTestController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userUuid = await getAuthenticatedUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await MicrosoftMailProvider.sendTestEmail(userUuid);

    return res.json({
      sent: true,
      sentTo: result.sentTo,
    });
  } catch (error) {
    console.error("[MicrosoftMail] Failed to send test email", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
