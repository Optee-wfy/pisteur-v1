import { describe, expect, it } from "vitest";
import { Pro } from "./pro.model";
import type { ProUuid } from "./schema";

describe("Pro Model", () => {
  it("should initialize a Pro object correctly", () => {
    const input = {
      uuid: "123e4567-e89b-12d3-a456-426614174000" as ProUuid,
      id: null,
      name: "Test Pro",
      street: "123 Test St",
      zipcode: "12345",
      city: "Test City",
      siret: "123456789",
      mailContact: "test@example.com",
      description: "Lorem ipsum",
      website: "sitetestexample.com",
    };

    const pro = Pro.init(input);

    expect(pro).not.toBeNull();
    expect(pro?.uuid).toBe(input.uuid);
    expect(pro?.id).toBeNull();
    expect(pro?.name).toBe(input.name);
    expect(pro?.street).toBe(input.street);
    expect(pro?.zipcode).toBe(input.zipcode);
    expect(pro?.city).toBe(input.city);
    expect(pro?.siret).toBe(input.siret);
    expect(pro?.mailContact).toBe(input.mailContact);
    expect(pro?.description).toBe(input.description);
    expect(pro?.website).toBe(input.website);
  });

  it("should return null and log error for invalid input", () => {
    const input = {
      id: null,
      name: "Test Pro",
      street: "123 Test St",
      zipcode: "12345",
      city: "Test City",
      siret: "123456789",
      mailContact: "test@example.com",
      description: "Lorem ipsum",
      website: "sitetestexample.com",
    };

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {
        console.log("Fake error");
      });

    //@ts-expect-error voluntarily omitting required field
    const pro = Pro.init(input);

    expect(pro).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should return formatted address", () => {
    const input = {
      uuid: "123e4567-e89b-12d3-a456-426614174000" as ProUuid,
      id: null,
      name: "Test Pro",
      street: "123 Test St",
      zipcode: "12345",
      city: "Test City",
      siret: "123456789",
      mailContact: "test@example.com",
      description: "Lorem ipsum",
      website: "sitetestexample.com",
    };

    const pro = Pro.init(input);

    expect(pro?.address).toBe("123 Test St, 12345 Test City");
  });

  it("should handle nullish values correctly", () => {
    const input = {
      uuid: "123e4567-e89b-12d3-a456-426614174000" as ProUuid,
      id: null,
      name: null,
      street: null,
      zipcode: null,
      city: null,
      siret: null,
      mailContact: null,
      description: null,
      website: null,
    };

    const pro = Pro.init(input);

    expect(pro).not.toBeNull();
    expect(pro?.name).toBe("Non renseigné");
    expect(pro?.street).toBeNull();
    expect(pro?.zipcode).toBeNull();
    expect(pro?.city).toBeNull();
    expect(pro?.siret).toBeNull();
    expect(pro?.mailContact).toBeNull();
    expect(pro?.description).toBeNull();
    expect(pro?.website).toBeNull();
  });
});
