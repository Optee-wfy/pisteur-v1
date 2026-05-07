import { BdnbProvider } from "@optee/bdnb-server";
import type { Request, Response } from "express";
import { z } from "zod";
import { checkCors } from "./helpers/check-cors";
import { HttpError } from "./helpers/http-error";

const ALLOWED_ORIGINS = ["https://optee.io", "https://app.optee.io"];

const bdnbInputSchema = z.object({
  address: z.string(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
});

/**
 * Express-compatible version of the BDNB handler
 */
export const bdnbController = async (req: Request, res: Response) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      if (checkCors(req, res, ALLOWED_ORIGINS)) {
        res.status(204).end();
      }
      return;
    }

    // Only allow GET requests
    if (req.method !== "GET") {
      throw HttpError.methodNotAllowed("Only GET method is allowed");
    }

    // Check CORS for actual request
    if (!checkCors(req, res, ALLOWED_ORIGINS)) {
      return;
    }

    // Parse and validate query parameters
    const data = {
      address: req.query["address"],
      lat: req.query["lat"] ? Number(req.query["lat"]) : null,
      lng: req.query["lng"] ? Number(req.query["lng"]) : null,
    };

    const parseResult = bdnbInputSchema.safeParse(data);
    if (!parseResult.success) {
      throw HttpError.badRequest("Invalid input parameters");
    }

    const { address, lat, lng } = parseResult.data;

    // Fetch BDNB data
    const bdnbData = await BdnbProvider.getDataFromAddress({
      address,
      latitude: lat,
      longitude: lng,
    });

    res.json({ data: bdnbData });
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des données BDNB:", error);

    // Handle HttpError with proper status code
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        error: error.message,
      });
    } else {
      res.status(500).json({
        error: "Erreur interne du serveur",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
