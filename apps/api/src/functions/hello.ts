import type { Request, Response } from "express";
import { HttpError } from "./helpers/http-error";

export const helloController = (_req: Request, res: Response) => {
  try {
    res.json({ message: "Hello World" });
  } catch (error: unknown) {
    console.error("Erreur dans hello controller:", error);

    // Handle HttpError with proper status code
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        error: error.message,
      });
    } else {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
