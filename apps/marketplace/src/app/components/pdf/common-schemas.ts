import { z } from "zod";

// Common template Schema
export const accountSchema = z.object({
  name: z.string(),
  billingAddress: z.string(),
  billingZipCode: z.string(),
  billingCity: z.string(),
});

export const locationSchema = z.object({
  streetNumber: z.string(),
  streetName: z.string(),
  zipcode: z.string(),
  city: z.string(),
  name: z.string(),
});
