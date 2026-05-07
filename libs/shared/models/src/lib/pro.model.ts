import { z, ZodError } from "zod";
import {
  formatProValueToArray,
  formatProValueToString,
} from "./pro-format.util";
import { ProHsId, ProUuid } from "./schema";

/**
 * Schema used to initialize an Pro object
 */
export const proSchema = z.object({
  uuid: ProUuid,
  id: ProHsId.nullish(), // Might not be synced with HubSpot yet
  name: z.string().nullish(),
  street: z.string().nullish(),
  zipcode: z.string().nullish(),
  city: z.string().nullish(),
  siret: z.string().nullish(),
  siren: z.string().nullish(),
  mailContact: z.string().nullish(),
  phoneContact: z.string().nullish(),
  description: z.string().nullish(),
  website: z.string().nullish(),
  calendarSite: z.string().nullish(),
  interventionZones: z.string().nullish(),
  interventionSectors: z.string().nullish(),
  prestations: z.string().nullish(),
  eligibilityCee: z.boolean().nullish(),
  rcsLocation: z.string().nullish(),
  capital: z.number().nullish(),
});
export type InputPro = z.infer<typeof proSchema>;

export const proWithoutIdsSchema = proSchema.omit({ id: true, uuid: true });
export type InputProWithoutIds = z.infer<typeof proWithoutIdsSchema>;

export type {
  MailConnectionStatus,
  PendingAction,
} from "./mail-provider.model";

/**
 * Pro model with improved properties and methods
 */
export class Pro {
  uuid: ProUuid;
  id: ProHsId | null;
  name: string;
  siret: string | null;
  siren: string | null;
  street: string | null;
  zipcode: string | null;
  city: string | null;
  mailContact: string | null;
  phoneContact: string | null;
  description: string | null;
  website: string | null;
  calendarSite: string | null;
  interventionZones: string[];
  interventionSectors: string[];
  prestations: string[];
  eligibilityCee: boolean;
  rcsLocation: string | null;
  capital: number | null;

  get address() {
    return `${this.street}, ${this.zipcode} ${this.city}`;
  }

  static formatToString(value: string[]) {
    return formatProValueToString(value);
  }

  static formatToArray(value: string) {
    return formatProValueToArray(value);
  }

  protected constructor(hsInput: InputPro) {
    const hsPro = proSchema.parse(hsInput);

    this.uuid = hsPro.uuid;
    this.id = hsPro.id ?? null;
    this.name = hsPro.name ?? "Non renseigné";
    this.siret = hsPro.siret ?? null;
    this.siren = hsPro.siren ?? null;
    this.street = hsPro.street ?? null;
    this.zipcode = hsPro.zipcode ?? null;
    this.city = hsPro.city ?? null;
    this.mailContact = hsPro.mailContact ?? null;
    this.phoneContact = hsPro.phoneContact ?? null;
    this.description = hsPro.description ?? null;
    this.website = hsPro.website ?? null;
    this.calendarSite = hsPro.calendarSite ?? null;
    this.interventionZones = hsInput.interventionZones
      ? Pro.formatToArray(hsInput.interventionZones)
      : [];
    this.interventionSectors = hsInput.interventionSectors
      ? Pro.formatToArray(hsInput.interventionSectors)
      : [];
    this.prestations = hsInput.prestations
      ? Pro.formatToArray(hsInput.prestations)
      : [];
    this.eligibilityCee = !!hsPro.eligibilityCee;
    this.rcsLocation = hsPro.rcsLocation ?? null;
    this.capital = hsPro.capital ?? null;
  }

  static init(hsInput: InputPro) {
    try {
      return new Pro(hsInput);
    } catch (e) {
      const message =
        e instanceof ZodError
          ? `Pro invalide [uuid: ${hsInput.uuid}]: ${e.message}`
          : e;

      console.error({
        error: message,
        data: hsInput,
      });

      return null;
    }
  }
}
