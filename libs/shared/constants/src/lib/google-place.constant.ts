import { z } from "zod";

const LAT_LNG_SCHEMA = z.object({
  lat: z.number(),
  lng: z.number(),
});

const BOUNDS_SCHEMA = z.object({
  northeast: LAT_LNG_SCHEMA,
  southwest: LAT_LNG_SCHEMA,
});

const ADDRESS_COMPONENT_SCHEMA = z.object({
  long_name: z.string(),
  short_name: z.string(),
  types: z.array(z.string()),
});

const GEOMETRY_SCHEMA = z.object({
  bounds: BOUNDS_SCHEMA.optional(),
  location: LAT_LNG_SCHEMA,
  location_type: z.string(),
  viewport: BOUNDS_SCHEMA,
});

const NAVIGATION_POINT_SCHEMA = z.object({
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export const PLACE_RESULT_SCHEMA = z.object({
  address_components: z.array(ADDRESS_COMPONENT_SCHEMA),
  formatted_address: z.string(),
  geometry: GEOMETRY_SCHEMA,
  navigation_points: z.array(NAVIGATION_POINT_SCHEMA).optional(),
  place_id: z.string(),
  types: z.array(z.string()),
});

export const GOOGLE_PLACES_RESPONSE_SCHEMA = z.object({
  results: z.array(PLACE_RESULT_SCHEMA),
  status: z.string(),
});

export type GooglePlacesResponse = z.infer<
  typeof GOOGLE_PLACES_RESPONSE_SCHEMA
>;
export type PlaceResult = z.infer<typeof PLACE_RESULT_SCHEMA>;
