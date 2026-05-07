import { z } from "zod";

// BRANDED ID
const youSignDocumentId = z.string().brand("YouSignDocumentId");
export type YouSignDocumentId = z.infer<typeof youSignDocumentId>;

const youSignSignerId = z.string().brand("YouSignSignerId");
export type YouSignSignerId = z.infer<typeof youSignSignerId>;

export const yousignRequestId = z.string().brand("YousignRequestId");
export type YouSignRequestId = z.infer<typeof yousignRequestId>;

const youSignFieldId = z.string().brand("YouSignFieldId");
export type YouSignFieldId = z.infer<typeof youSignFieldId>;

// EVENTS
export enum YouSignEventEnum {
  STARTED = "started",
  SUCCESS = "success",
  ERROR = "error",
  PING = "ping",
  DECLINED = "declined",
  SIGNATUREDONE = "signature.done",
}
export const youSignEventSchema = z.object({
  event: z.nativeEnum(YouSignEventEnum),
  signature_request_id: yousignRequestId,
  signer_id: youSignSignerId,
  type: z.enum(["yousign"]),
});
export type YouSignEvent = z.infer<typeof youSignEventSchema>;

export const SignatureEvents = [
  "signature_request.done",
  "signature_request.declined",
  "signature_request.expired",
  "signature_request.canceled",
  "signature_request.deleted",
] as const;
export const signatureEventSchema = z.enum(SignatureEvents);

// DOCUMENTS
export const youSignDocumentSchema = z.object({
  id: youSignDocumentId,
  filename: z.string().optional(),
  nature: z.string(),
  total_pages: z.number().optional(),
  total_anchors: z.number().optional(),
  created_at: z
    .string()
    .transform((arg) => new Date(arg))
    .optional(),
  content_type: z.string().optional(),
});
export type YouSignDocument = z.infer<typeof youSignDocumentSchema>;

// FIELDS
export enum YouSignFieldType {
  TEXT = "text",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  SELECT = "select",
  DATE = "date",
  SIGNATURE = "signature",
  READ_ONLY = "read_only_text",
}

export const youSignFieldLocationSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  page: z.number(),
});

export type YouSignLocation = z.infer<typeof youSignFieldLocationSchema>;

export const youSignFieldSchema = youSignFieldLocationSchema.extend({
  id: youSignFieldId,
  document_id: youSignDocumentId,
  type: z.nativeEnum(YouSignFieldType),
  signer_id: youSignSignerId.nullish(),
});
export type YouSignField = z.infer<typeof youSignFieldSchema>;

// SIGNERS
export const youSignSignerSchema = z.object({
  id: youSignSignerId,
  info: z
    .object({
      first_name: z.string(),
      last_name: z.string(),
      email: z.string(),
      phone_number: z.string().nullish(),
      locale: z.string().nullish(),
    })
    .nullish(),
  deliver_mode: z.string().nullish(),
  fields: z.array(youSignFieldSchema).nullish(),
  signature_level: z.string().nullish(),
  signature_link: z.string().nullish(),
  signature_link_expiration_date: z
    .string()
    .transform((arg) => new Date(arg))
    .nullish(),
  status: z.string(),
});
export type YouSignSigner = z.infer<typeof youSignSignerSchema>;

// SIGNATURE REQUEST (https://api.yousign.com/v3/signature-requests)
export enum YouSignRequestStatus {
  DRAFT = "draft",
  ONGOING = "ongoing",
  DONE = "done",
  DELETED = "deleted",
  EXPIRED = "expired",
  CANCELED = "canceled",
  APPROVAL = "approval",
  REJECTED = "rejected",
  DECLINED = "declined",
}

/**
 *
 * @param status Signature request status
 * @returns true if signature done, false if its corrupted, null for unsupported status.
 */
export const isSignatureDone = (status: YouSignRequestStatus) => {
  if (status === YouSignRequestStatus.DONE) {
    return true;
  }

  if (status !== YouSignRequestStatus.ONGOING) {
    console.error(
      "Signature request is no longer valid. Current status: ",
      status,
    );
  }

  if (
    [
      YouSignRequestStatus.DECLINED,
      YouSignRequestStatus.CANCELED,
      YouSignRequestStatus.EXPIRED,
      YouSignRequestStatus.REJECTED,
      YouSignRequestStatus.DELETED,
      YouSignRequestStatus.APPROVAL,
    ].includes(status)
  ) {
    return false;
  }

  return null;
};

export const youSignRequestSchema = z.object({
  id: yousignRequestId,
  status: z.nativeEnum(YouSignRequestStatus),
  delivery_mode: z.string(),
  created_at: z.string(),
  expiration_date: z.string().transform((arg) => new Date(arg)),
  documents: z.array(youSignDocumentSchema),
  name: z.string(),
  ordered_signers: z.boolean(),
  signers: z.array(youSignSignerSchema),
  signers_allowed_to_decline: z.boolean(),
});
export type YouSignRequest = z.infer<typeof youSignRequestSchema>;

export const yousignHookEventSchema = z.object({
  event_id: z.string().uuid(),
  event_name: signatureEventSchema,
  data: z.object({
    signature_request: z.object({ id: yousignRequestId }),
  }),
});
export type YousignHookEvent = z.infer<typeof yousignHookEventSchema>;

// YOUSIGN ERROR RESPONSE
export const yousignErrorResponseSchema = z.object({
  type: z.string(),
  detail: z.string(),
  invalid_params: z
    .array(
      z.object({
        name: z.string(),
        reason: z.string(),
      }),
    )
    .nullish(),
});
export type YousignErrorResponse = z.infer<typeof yousignErrorResponseSchema>;
