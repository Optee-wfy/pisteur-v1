import { CLIENT_TYPES, ClientType } from "@optee/constants";
import { formatZodError } from "@optee/utils";
import { z, ZodError } from "zod";
import type { HubspotClient } from "./schema";
import { ClientHsId, ClientUuid, OwnerHsId } from "./schema";

export const clientSchema = z.object({
  uuid: ClientUuid,
  id: ClientHsId,
  name: z.string(),
  accountType: z.enum(CLIENT_TYPES).nullish(),
  type: z.string().nullish(),
  website: z.string().nullish(),
  ownerId: OwnerHsId.nullish(),
  ownerCsmId: OwnerHsId.nullish(),
  billingAddress: z.string().nullish(),
  billingCity: z.string().nullish(),
  billingZipCode: z.string().nullish(),
  siret: z.string().nullish(),
});

export class Client {
  uuid: ClientUuid;
  id: ClientHsId;
  name: string;
  type: string | null;
  website: string | null;
  ownerId: OwnerHsId | null;
  ownerCsmId: OwnerHsId | null;
  billingAddress: string | null;
  billingCity: string | null;
  billingZipCode: string | null;
  siret: string | null;
  accountType: ClientType;

  protected constructor(hsInput: HubspotClient) {
    const hsClient = clientSchema.parse(hsInput);

    this.uuid = hsClient.uuid;
    this.id = hsClient.id;
    this.name = hsClient.name;
    this.type = hsClient.type ?? null;
    this.website = hsClient.website ?? null;
    this.ownerId = hsClient.ownerId ?? null;
    this.ownerCsmId = hsClient.ownerCsmId ?? null;
    this.billingAddress = hsClient.billingAddress ?? null;
    this.billingCity = hsClient.billingCity ?? null;
    this.billingZipCode = hsClient.billingZipCode ?? null;
    this.siret = hsClient.siret ?? null;
    this.accountType = hsClient.accountType ?? ClientType.OTHER;
  }

  static init(hsInput: HubspotClient) {
    try {
      return new Client(hsInput);
    } catch (e) {
      console.error(
        e instanceof ZodError
          ? `Client invalide: ${formatZodError(e).errors?.join(", et ")}`
          : e,
        { uuid: hsInput?.uuid, id: hsInput?.id, name: hsInput?.name },
      );
      return null;
    }
  }
}
