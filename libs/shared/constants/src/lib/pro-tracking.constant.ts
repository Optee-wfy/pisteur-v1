export const PRO_TRACKING_EVENTS = {
  pro_login: {
    name: "pro_login",
    properties: {
      last_login_date: [],
    },
  },
  pro_credits_consumed: {
    name: "pro_credits_consumed",
    properties: {
      credits_used: [],
      type: ["contact", "entreprise", "batiment"],
      enrichment_channel: ["email", "telephone", "all"],
      source_page: ["batiment", "entreprise", "contact"],
      entity_id: [],
      entity_name: [],
      action: [],
      contact_search_filters: [],
    },
  },
  pro_filters_used: {
    name: "pro_filters_used",
    properties: {
      source_component: [],
      filters_page_type: ["places", "legal-entities"],
      filters_count: [],
      global_filters_keys: [],
      global_filters_values: [],
      active_filter_key: [],
      active_filter_value: [],
    },
  },
} as const;

export type ProTrackingEventId = keyof typeof PRO_TRACKING_EVENTS;

export type ProTrackingEventProperties<T extends ProTrackingEventId> =
  (typeof PRO_TRACKING_EVENTS)[T]["properties"];

export const PRO_TRACKING_EVENTS_IDS = Object.keys(PRO_TRACKING_EVENTS) as [
  ProTrackingEventId,
  ...ProTrackingEventId[],
];
