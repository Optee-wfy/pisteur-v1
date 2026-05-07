import type { Request, Response } from "express";

/**
 * Express-compatible version of checkCors
 */
export function checkCors(
  req: Request,
  res: Response,
  allowedOrigins: string[],
): boolean {
  const origin = req.headers["origin"];
  if (!origin || !allowedOrigins.includes(origin)) {
    res.status(403).json({ error: "Forbidden: CORS" });
    return false;
  }
  res.set("Access-Control-Allow-Origin", origin);
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  return true;
}
