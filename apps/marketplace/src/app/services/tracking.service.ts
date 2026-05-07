import * as amplitude from "@amplitude/unified";
import { Injectable } from "@angular/core";
import type {
  ClientTrackingEventId,
  ProTrackingEventId,
} from "@optee/constants";
import type { ContactHsId, ContactUuid } from "@optee/models";
import posthog from "posthog-js";
import trpcClient, { TRPC_SKIP_BATCH_KEY } from "../../trpc-client";

// Declare global gtag variable
declare const gtag: (
  command: string,
  eventName: string,
  params?: Record<string, any>,
) => void;

// Declare global fbq variable
declare const fbq: (
  command: string,
  eventName: string,
  params?: Record<string, any>,
) => void;

@Injectable({
  providedIn: "root",
})
export class TrackingService {
  identifyPostHog({
    contactUuid,
    contactHsId,
    email,
    userUuid,
    firstname,
    lastname,
  }: {
    contactUuid: ContactUuid;
    contactHsId: ContactHsId | null;
    firstname: string | null;
    lastname: string | null;
    userUuid: string | null;
    email: string | null;
  }) {
    posthog.identify(contactUuid, {
      email,
      contactHsId,
      userUuid,
      firstname,
      lastname,
    });
    // posthog.register({ email });
  }

  identifyAmplitude({
    contactUuid,
    contactHsId,
    email,
    userUuid,
    firstname,
    lastname,
    proUuid,
    proHsId,
    proName,
    credits,
    isAdminOptee,
    subscription,
  }: {
    contactUuid: ContactUuid;
    contactHsId: ContactHsId | null;
    firstname: string | null;
    lastname: string | null;
    userUuid: string | null;
    email: string | null;
    proUuid?: string | null;
    proHsId?: string | null;
    proName?: string | null;
    credits?: number | null;
    isAdminOptee?: boolean | null;
    subscription: string | null;
  }) {
    if (typeof window !== "undefined") {
      if (userUuid) {
        amplitude.setUserId(userUuid);
      }
      const identify = new amplitude.Identify();

      const nameParts = [firstname, lastname].filter(Boolean);
      identify.set("name", nameParts.length ? nameParts.join(" ") : "Anonyme");
      if (email) {
        identify.set("email", email);
      }
      if (contactUuid) {
        identify.set("contactUuid", contactUuid);
      }
      if (contactHsId) {
        identify.set("contactHsId", contactHsId);
      }

      if (proUuid) {
        identify.set("proUuid", proUuid);
      }
      if (proHsId) {
        identify.set("proHsId", proHsId);
      }
      if (proName) {
        identify.set("proName", proName);
      }
      if (credits !== undefined) {
        identify.set("credits", credits ?? 0);
      }
      if (isAdminOptee !== undefined) {
        identify.set("isAdminOptee", isAdminOptee ?? false);
      }
      if (subscription !== null) {
        identify.set("subscription", subscription);
      }
      amplitude.identify(identify);
    }
  }

  resetIdentity() {
    if (typeof window !== "undefined") {
      amplitude.reset();
    }
  }

  async trackClient(
    eventId: ClientTrackingEventId,
    properties?: Record<string, string>,
  ) {
    await trpcClient.users.trackEvent.mutate(
      {
        eventId,
        properties,
      },
      {
        context: {
          [TRPC_SKIP_BATCH_KEY]: true,
        },
      },
    );

    amplitude.track(eventId, properties);

    posthog.capture(eventId, properties);
  }

  trackPro(
    eventId: ProTrackingEventId,
    properties?: Record<
      string,
      string | number | boolean | Record<string, string | number | boolean>
    >,
  ) {
    amplitude.track(eventId, properties);
    posthog.capture(eventId, properties);
  }

  trackPageView(url: string): void {
    // Google Analytics
    if (typeof gtag === "function") {
      gtag("event", "page_view", {
        page_path: url,
      });
    }

    // Facebook Pixel
    if (typeof fbq === "function") {
      fbq("track", "PageView");
    }
  }

  trackConversionSignup() {
    if (typeof gtag === "function") {
      gtag("event", "conversion_event_signup");
    }
  }
}
