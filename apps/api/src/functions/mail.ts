import { MARKETPLACE_UI_URL } from "@optee/constants";
import { MailersendProvider } from "@optee/mailersend-server";
import type { Request, Response } from "express";
import { HttpError } from "./helpers/http-error";

/**
 * Express-compatible version of the mail handler
 */
export const mailController = async (_req: Request, res: Response) => {
  try {
    if (process.env["VITE_ENV"] !== "development") {
      throw HttpError.forbidden(
        "Cette ressource n'est pas disponible en dehors de l'environnement de développement.",
      );
    }

    await MailersendProvider.sendEmail({
      to: [{ email: "louis.godlewski@optee.io", name: "Louis" }],
      subject: "Test d'envoi d'email",
      template: "NEW_QUOTE",
      data: {
        quoteName: "Devis de test",
        redirectLink: `${MARKETPLACE_UI_URL}/client/quotes/123456`,
      },
    });

    res.json({ message: "Email envoyé avec succès !" });
  } catch (error: unknown) {
    console.error("Erreur lors de l'envoi d'email:", error);

    // Handle HttpError with proper status code
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "Erreur lors de l'envoi d'email",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
