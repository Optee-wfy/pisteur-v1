import type { QuoteStageAllowed } from "@optee/constants";
import { QUOTE_STAGES_ALLOWED } from "@optee/constants";
import { z, ZodError } from "zod";
import type { AttachmentHsId, HubspotQuote } from "./schema";
import { QuoteHsId, QuoteUuid } from "./schema";

/**
 * Schema used to initialize a Quote object
 */
export const quoteSchema = z.object({
  uuid: QuoteUuid,
  id: QuoteHsId.nullish(), // Might not be synced with HubSpot yet
  stage: z.enum(QUOTE_STAGES_ALLOWED),
  preTaxAmount: z.number().nullish(),
  postTaxAmount: z.number().nullish(),
  fundingAmount: z.number().nullish(),
  name: z.string().nullish(),
  signRequestYousignId: z.string().nullish(),
  signerYousignId: z.string().nullish(),
  url: z.string().nullish(),
  lastModifiedAt: z.string().nullish(),
});

export class Quote {
  uuid: QuoteUuid;
  id: QuoteHsId | null;
  stage: QuoteStageAllowed;
  preTaxAmount: number | null;
  postTaxAmount: number | null;
  fundingAmount: number;
  name: string | null;
  signRequestYousignId: string | null;
  signerYousignId: string | null;
  url: string | null;
  fileId: AttachmentHsId | null;
  lastModifiedAt?: string | null;

  /**
   * Constructor for Quote - private to enforce validation via init method
   */
  protected constructor(hsInput: HubspotQuote, fileId?: AttachmentHsId | null) {
    const hsQuote = quoteSchema.parse(hsInput);

    this.uuid = hsQuote.uuid;
    this.id = hsQuote.id ?? null;

    if (!z.enum(QUOTE_STAGES_ALLOWED).safeParse(hsQuote.stage).success) {
      throw new Error(`Invalid stage: ${hsQuote.stage}`);
    }

    this.stage = hsQuote.stage;
    this.preTaxAmount = hsQuote.preTaxAmount ?? null;
    this.postTaxAmount = hsQuote.postTaxAmount ?? null;
    this.name = hsQuote.name ?? null;
    this.signRequestYousignId = hsQuote.signRequestYousignId ?? null;
    this.signerYousignId = hsQuote.signerYousignId ?? null;
    this.url = hsQuote.url ?? null;
    this.lastModifiedAt = hsQuote.lastModifiedAt;
    this.fundingAmount = hsQuote.fundingAmount ?? 0;
    this.fileId = fileId ?? null;
  }

  static init({
    hsQuote,
    fileId,
  }: {
    hsQuote: HubspotQuote;
    fileId?: AttachmentHsId | null;
  }) {
    try {
      return new Quote(hsQuote, fileId);
    } catch (e) {
      const message =
        e instanceof ZodError
          ? `Devis invalide [uuid: ${hsQuote.uuid}]: ${e.message}`
          : e;

      console.error({
        error: message,
        data: hsQuote,
      });

      return null;
    }
  }

  hasSubvention() {
    return this.fundingAmount > 0;
  }
}
