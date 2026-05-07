import type { IsoWeekday } from "@optee/utils";
import z from "zod";

export const DAYS = {
  sunday: "dimanche",
  monday: "lundi",
  tuesday: "mardi",
  wednesday: "mercredi",
  thursday: "jeudi",
  friday: "vendredi",
  saturday: "samedi",
};

const isoWeekdaySchema = z.custom<IsoWeekday>(
  (v) => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 7,
  (input) => ({ message: "day must be 0..7 (ISO weekday)", value: input }),
);

const periodDateSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
});

const timePointSchema = z.object({
  day: isoWeekdaySchema,
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  date: periodDateSchema,
});

const periodSchema = z.object({
  open: timePointSchema,
  close: timePointSchema,
});

export const currentOpeningHoursSchema = z
  .object({
    periods: z.array(periodSchema).optional(),
    openNow: z.boolean().optional(),
  })
  .optional();

export const SIX_MONTHS_DURATION = 1000 * 60 * 60 * 24 * 30 * 6;
export const THREE_MONTHS_DURATION = 1000 * 60 * 60 * 24 * 30 * 3;
