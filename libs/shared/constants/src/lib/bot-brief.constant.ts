import type { Prettify } from "@optee/utils";
import { z } from "zod";

const responseList = {
  name: "response_list",
  strict: true,
  schema: {
    type: "object",
    properties: {
      response: {
        type: "array",
        description: "List of string elements.",
        items: {
          type: "string",
          description: "String element in the response data.",
        },
      },
    },
    required: ["response"],
    additionalProperties: false,
  },
};

const simpleResponse = {
  name: "simple_response",
  strict: true,
  schema: {
    type: "object",
    properties: {
      response: {
        type: "string",
        description: "The response content.",
      },
    },
    required: ["response"],
    additionalProperties: false,
  },
};

export const BOT_ASSISTANTS = {
  eligibilityCriteriaCEE: {
    name: "eligibilityCriteriaCEE",
    id: "asst_R852nKCmAEKERtrEy2YQrXjg",
    schema: z.array(z.string()).nullish(),
    json: responseList,
  },
  qualificationsNeeded: {
    name: "qualificationsNeeded",
    id: "asst_BkJ9mUb3ypyabGzTBf33ub1D",
    schema: z.array(z.string()).nullish(),
    json: responseList,
  },
  checksOperations: {
    name: "checksOperations",
    id: "asst_HZiINNPfhBsoJ02aRjL7nbhK",
    schema: z.array(z.string()).nullish(),
    json: responseList,
  },
  justificationChoiceOperations: {
    name: "justificationChoiceOperations",
    id: "asst_BrBpJWvJcr6LNQFKNN6Evr2x",
    schema: z.array(z.string()).nullish(),
    json: responseList,
  },
  goalMOA: {
    name: "goalMOA",
    id: "asst_JCItyB8ygra3MvRdIq0xTwDF",
    schema: z.string().nullish(),
    json: simpleResponse,
  },
  buildingType: {
    name: "buildingType",
    id: "asst_nVhd5pNHkimxSQePcNlmQJvC",
    schema: z.string().nullish(),
    json: simpleResponse,
  },
  buildingCriterias: {
    name: "buildingCriterias",
    id: "asst_aK5bSBLQzi7DDk1zbQupOfYn",
    schema: z.string().nullish(),
    json: simpleResponse,
  },
  technicalConstraint: {
    name: "technicalConstraint",
    id: "asst_mcuaLt6FSxVhowaTa6gykPLX",
    schema: z.string().nullish(),
    json: simpleResponse,
  },
} as const;
export type BriefSectionKey = keyof typeof BOT_ASSISTANTS;
export const BRIEF_SECTIONS = Object.values(BOT_ASSISTANTS).map((b) => b.name);

export const BOT_BRIEF_SCHEMA = z.object({
  eligibilityCriteriaCEE: BOT_ASSISTANTS.eligibilityCriteriaCEE.schema,
  qualificationsNeeded: BOT_ASSISTANTS.qualificationsNeeded.schema,
  checksOperations: BOT_ASSISTANTS.checksOperations.schema,
  justificationChoiceOperations:
    BOT_ASSISTANTS.justificationChoiceOperations.schema,
  goalMOA: BOT_ASSISTANTS.goalMOA.schema,
  buildingType: BOT_ASSISTANTS.buildingType.schema,
  buildingCriterias: BOT_ASSISTANTS.buildingCriterias.schema,
  technicalConstraint: BOT_ASSISTANTS.technicalConstraint.schema,
});

export type OperationBrief = Prettify<z.infer<typeof BOT_BRIEF_SCHEMA>>;
