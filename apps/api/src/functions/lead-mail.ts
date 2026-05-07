import { ProspectProvider } from "@optee/prospect-server";
import type { Request, Response } from "express";

export const LeadsMailController = async (_req: Request, res: Response) => {
  try {
    const result = await ProspectProvider.sendLeadsMails();
    const sanitizedResults = result.results.map(
      ({ recipient, ...item }) => item,
    );

    return res.json({
      ...result,
      results: sanitizedResults,
    });
  } catch (error: unknown) {
    console.error(
      "Erreur lors de l'envoi des emails depuis LeadParametersTable:",
      error,
    );

    return res.status(500).json({
      message: "Erreur lors de l'envoi des emails de prospection",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
