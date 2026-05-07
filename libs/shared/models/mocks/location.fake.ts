import type { LocationHsId, LocationUuid } from "../src/index";
import { Location } from "../src/index";

export const validLocationInput = {
  uuid: "uuid" as LocationUuid,
  id: "id" as LocationHsId,
  name: "A valid location",
  street: "street",
  zipcode: "zipcode",
  city: "city",
  siren: "siren",
  mailContact: "mailContact",
};

export const FAKE_LOCATION_VALID = Location.init(validLocationInput);
