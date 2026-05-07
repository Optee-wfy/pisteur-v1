import type { Role } from "@optee/constants";
import { ROLES_SLUGS } from "@optee/constants";
import { z, ZodError } from "zod";
import type { HubspotContact, UserUuid } from "./schema";
import { ContactUuid, LocationUuid } from "./schema";

export const contactSchema = z.object({
  uuid: ContactUuid,
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  email: z.string().nullish(),
  role: z.enum(ROLES_SLUGS),
  locations: z.array(
    z.object({
      uuid: LocationUuid,
      name: z.string(),
    }),
  ),
});

export class Contact {
  uuid: ContactUuid;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role?: Role | null | undefined;
  locations: { uuid: LocationUuid; name: string }[];
  userUuid?: UserUuid | null | undefined;

  protected constructor(hsInput: HubspotContact) {
    const hsContact = contactSchema.parse(hsInput);

    this.uuid = hsContact.uuid;
    this.firstName = hsContact.firstName ?? null;
    this.lastName = hsContact.lastName ?? null;
    this.email = hsContact.email ?? null;
    this.role = hsContact.role;
    this.locations = hsContact.locations
      ? hsContact.locations.map((location) => ({
          uuid: location.uuid,
          name: location.name,
        }))
      : [];
  }

  static init(hsInput: HubspotContact) {
    try {
      return new Contact(hsInput);
    } catch (e) {
      const message =
        e instanceof ZodError
          ? `Contact invalid [uuid: ${hsInput.uuid}]: ${e.message}`
          : e;

      console.error({
        error: message,
        data: hsInput,
      });

      return null;
    }
  }
}
