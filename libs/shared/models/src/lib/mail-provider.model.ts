import { z } from "zod";

export const MAIL_PROVIDERS = ["google", "microsoft"] as const;

export const MailProvider = z.enum(MAIL_PROVIDERS);
export type MailProvider = z.infer<typeof MailProvider>;

export type MailConnectionStatus = "connected" | "disconnected";
export type PendingAction = "connect" | "disconnect" | "sendTest" | null;
