import type { ClientTrackingEventId } from "@optee/constants";
import { CLIENT_TRACKING_EVENTS, DEMO_FILE_URL } from "@optee/constants";
import type { AttachmentHsId, OperationHsId } from "@optee/models";
import {
  AttachmentHsId as AttachmentHsIdSchema,
  type ClientHsId,
  type ContactHsId,
  type LocationHsId,
  type ProHsId,
} from "@optee/models";
import { NoteRepository } from "@optee/note-server";
import { z } from "zod";
import {
  HubspotTokenProvider,
  isHubspotCompatibleEnvironment,
} from "./hubspot-token.provider";

const bearer = process.env["STACKSYNC_BEARER_TOKEN"];

const proxy_url = (url: string) =>
  isHubspotCompatibleEnvironment
    ? `https://eu.api-proxy.stacksync.cloud/v1/proxy/${url}`
    : "https://nooooo";

// Zod schemas for API responses
const hubspotUploadResponseSchema = z.object({
  id: z.string(),
});

const hubspotAssociationResultSchema = z.object({
  associationTypes: z.array(
    z.object({
      category: z.string(),
      label: z.string().nullable(),
      typeId: z.number(),
    }),
  ),
  toObjectId: z.string(),
});

const hubspotAssociationResultsResponseSchema = z.object({
  results: z.array(hubspotAssociationResultSchema),
});

const hubspotFileUrlResponseSchema = z.object({
  url: z.string().optional(),
});

const hubspotPropertyOptionSchema = z.object({
  description: z.string().optional(),
  displayOrder: z.number(),
  hidden: z.boolean(),
  label: z.string(),
  value: z.string(),
});

const hubspotPropertySchema = z.object({
  archived: z.boolean(),
  calculated: z.boolean(),
  createdAt: z.string().datetime(),
  createdUserId: z.string(),
  dataSensitivity: z.enum(["non_sensitive"]),
  description: z.string(),
  displayOrder: z.number(),
  externalOptions: z.boolean(),
  fieldType: z.enum(["checkbox"]),
  formField: z.boolean(),
  groupName: z.string(),
  hasUniqueValue: z.boolean(),
  hidden: z.boolean(),
  label: z.string(),
  modificationMetadata: z.object({
    archivable: z.boolean(),
    readOnlyDefinition: z.boolean(),
    readOnlyValue: z.boolean(),
  }),
  name: z.string(),
  options: z.array(hubspotPropertyOptionSchema),
  type: z.enum(["enumeration"]),
  updatedAt: z.string().datetime(),
  updatedUserId: z.string(),
});
/** Generic helper – do **not** export */
async function deleteContactAssociation(
  contactHsId: ContactHsId,
  toObjectType: string,
  toObjectId: string,
) {
  if (!isHubspotCompatibleEnvironment) {
    return;
  }
  const res = await fetch(
    proxy_url(
      `https://api.hubapi.com/crm/v4/objects/contact/${contactHsId}/associations/${toObjectType}/${toObjectId}`,
    ),
    { headers: { Authorization: `Bearer ${bearer}` }, method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(
      `Failed to delete association between contact ${contactHsId} and ${toObjectType.slice(
        0,
        -1,
      )} ${toObjectId}`,
    );
  }
  return res;
}

export const HubspotProvider = {
  /**
   * Upload a file to HubSpot to be used as an attachment
   * FormData must contain the file to upload & folderPath
   * @param formData form containing the file to upload
   * @returns the UUID of the note attached to the file
   */
  uploadFile: async ({
    file,
    folderPath,
    fileName,
  }: {
    file: Blob;
    folderPath: string;
    fileName: string;
  }) => {
    // Only send file to Hubspot in production / preview modes.
    if (!isHubspotCompatibleEnvironment) {
      return Promise.resolve(null);
    }
    const formData = new FormData();
    fileName = fileName.endsWith(".pdf") ? fileName : fileName + ".pdf";
    formData.append("folderPath", folderPath);
    formData.append("file", file, fileName);
    formData.append("options", JSON.stringify({ access: "PUBLIC_INDEXABLE" }));

    const uploadResponse = await fetch(
      proxy_url("https://api.hubapi.com/files/v3/files"),
      {
        body: formData,
        headers: {
          Authorization: `Bearer ${bearer}`,
          contentType: "multipart/form-data",
        },
        method: "POST",
      },
    );

    if (!uploadResponse.ok) {
      throw new Error(uploadResponse.statusText);
    }

    const rawData = await uploadResponse.json();
    const parseResult = hubspotUploadResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Invalid HubSpot upload response:", parseResult.error);
      throw new Error("Failed to parse upload response");
    }

    const { id: attachmentId } = parseResult.data;

    if (!attachmentId) {
      throw new Error("Failed to upload file");
    }

    return NoteRepository.associateToAttachment(
      AttachmentHsIdSchema.parse(attachmentId),
    );
  },

  // Source: https://developers.hubspot.com/docs/guides/api/crm/associations/associations-v4
  getAssociations: async ({
    fromObjectType,
    fromObjectId,
    toObjectType,
  }: {
    fromObjectType: string;
    fromObjectId: string;
    toObjectType: string;
  }) => {
    const response = await fetch(
      proxy_url(
        `https://api.hubapi.com/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}`,
      ),
      {
        headers: {
          Authorization: `Bearer ${bearer}`,
        },
        method: "GET",
      },
    );

    const rawData = await response.json();
    const parseResult =
      hubspotAssociationResultsResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      console.error(
        "Invalid HubSpot associations response:",
        parseResult.error,
      );
      throw new Error("Failed to parse associations response");
    }

    return parseResult.data.results;
  },

  getPropertyInfos: async (objectType: string, propertySlug: string) => {
    // Source: https://developers.hubspot.com/docs/guides/api/crm/properties#retrieve-properties
    const response = await fetch(
      proxy_url(
        `https://api.hubapi.com/crm/v3/properties/${objectType}/${propertySlug}`,
      ),
      {
        headers: {
          Authorization: `Bearer ${bearer}`,
        },
        method: "GET",
      },
    );

    const res = await response.json();

    if (!res) {
      throw new Error(
        `Failed to get property infos for ${objectType} ${propertySlug}`,
      );
    }

    const { data, error } = hubspotPropertySchema.safeParse(res);

    if (error) {
      const formattedErrors = error.errors
        .map((err) => ({
          path: err.path.join("."), // Join path elements (e.g., 'user.name')
          message: err.message, // Error message
        }))
        .map((err) => `- ${err.path}: ${err.message}`)
        .join("; ");

      throw new Error(
        `Failed to parse property infos for ${objectType} ${propertySlug}: ${formattedErrors}`,
      );
    }

    return data;
  },

  trackEvent: async ({
    eventId,
    email,
    properties,
  }: {
    eventId: ClientTrackingEventId;
    email: string;
    properties?: Record<string, string>;
  }) => {
    if (!isHubspotCompatibleEnvironment) {
      return;
    }

    const eventName = CLIENT_TRACKING_EVENTS[eventId].name;

    const accessToken = await HubspotTokenProvider.get();

    const eventPayload = {
      eventName,
      email,
      properties,
      timestamp: new Date().toISOString(),
    };

    const sendRes = await fetch("https://api.hubapi.com/events/v3/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    const rawBody = await sendRes.text();

    let parsedBody: unknown = null;

    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : null;
    } catch (err) {
      console.warn("Impossible de parser la réponse JSON de HubSpot", rawBody);
    }

    if (!sendRes.ok) {
      console.error("HubSpot error:", parsedBody || rawBody);
      return false;
    }

    return true;
  },

  deleteContactAssociationWithLocation: async (
    contactHsId: ContactHsId,
    locationHsId: LocationHsId,
  ) => {
    if (!isHubspotCompatibleEnvironment) {
      return;
    }
    return deleteContactAssociation(contactHsId, "batiments", locationHsId);
  },

  deleteContactAssociationWithClient: (
    contactHsId: ContactHsId,
    clientHsId: ClientHsId,
  ) => {
    if (!isHubspotCompatibleEnvironment) {
      return;
    }
    return deleteContactAssociation(contactHsId, "clients", clientHsId);
  },

  deleteContactAssociationWithPro: async (
    contactHsId: ContactHsId,
    proHsId: ProHsId,
  ) => {
    if (!isHubspotCompatibleEnvironment) {
      return;
    }
    return deleteContactAssociation(contactHsId, "pros", proHsId);
  },

  deleteContactAssociationWithOperation: async (
    contactHsId: ContactHsId,
    operationHsId: OperationHsId,
  ) => {
    if (!isHubspotCompatibleEnvironment) {
      return;
    }
    return deleteContactAssociation(contactHsId, "deals", operationHsId);
  },

  getFileUrl: async (fileId: AttachmentHsId | null) => {
    // Only fetch hubspot file url in production / preview modes.
    if (!isHubspotCompatibleEnvironment) {
      return DEMO_FILE_URL;
    }

    if (!fileId) {
      return null;
    }

    const response = await fetch(
      proxy_url(`https://api.hubapi.com/files/v3/files/${fileId}/signed-url`),
      {
        headers: {
          Authorization: `Bearer ${bearer}`,
        },
        method: "GET",
      },
    );

    const rawData = await response.json();
    const parseResult = hubspotFileUrlResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Invalid HubSpot file URL response:", parseResult.error);
      throw new Error("Failed to parse file URL response");
    }

    const url = parseResult.data.url;
    if (!url) {
      throw new Error(
        `Récupération de l'url du fichier avec l'id: ${fileId} échouée`,
      );
    }

    return url as string;
  },
};
