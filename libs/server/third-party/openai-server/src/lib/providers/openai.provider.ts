import type {
  BriefSectionKey,
  MainSector,
  OperationSubTypeInfo,
} from "@optee/constants";
import { BOT_ASSISTANTS, getOperationTypeCeeFile } from "@optee/constants";
import { type HubspotLocationBdnbData } from "@optee/models";
import { formatZodError } from "@optee/utils";
import OpenAI from "openai";
import z from "zod";

let _openai: OpenAI | null = null;
const getOpenAI = () => {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env["OPENAI_ASSISTANT_API_KEY"] ?? "placeholder",
      defaultHeaders: {
        "api-key": process.env["OPENAI_ASSISTANT_API_KEY"] ?? "placeholder",
      },
    });
  }
  return _openai;
};
const openai = new Proxy({} as OpenAI, { get: (_, prop) => (getOpenAI() as any)[prop] });

const LEAD_DETAILS_ASSISTANT_ID = "asst_om8ahhZC3oVA0Q4VDNvbpcK3";

export const OpenAIProvider = {
  async askAssistant({
    section,
    prompt,
  }: {
    section: BriefSectionKey;
    prompt: string;
  }) {
    const assistant = BOT_ASSISTANTS[section];
    const currentThreadId = (await openai.beta.threads.create({})).id;

    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: prompt,
    });

    const run = await openai.beta.threads.runs.createAndPoll(currentThreadId, {
      assistant_id: assistant.id,
      response_format: {
        type: "json_schema",
        json_schema: assistant.json,
      },
    });

    const assistantMessages = await openai.beta.threads.messages.list(
      run.thread_id,
    );

    // Only keep first assistant messages
    const message = assistantMessages.data
      .filter((m) => m.role === "assistant")
      .at(0);

    if (!message) {
      throw new Error("L'assistant n'a pas répondu");
    }

    const response =
      message.content
        .filter((c) => c.type === "text")
        ?.at(0)
        ?.text?.value?.replace(/【.*?】/g, "")
        ?.replace(/```/g, "") ?? null;

    if (!response) {
      throw new Error(
        "Aucune réponse renvoyée par l'assistant: " + assistant.name,
      );
    }

    let content;
    try {
      content = JSON.parse(response)?.response;
    } catch (e) {
      throw new Error(`Invalid JSON response from assistant ${section}: ${e}`);
    }
    const parsed = assistant.schema.safeParse(content);

    if (parsed.error || !parsed.data) {
      throw new Error(
        "L'assistant n'a pas renvoyé la réponse attendue:\n" +
          (formatZodError(parsed.error)?.errors?.join(", ") ??
            "Aucun contenu renvoyé."),
      );
    }

    return parsed.data;
  },

  askBriefAssistantForMarketplace: async ({
    bdnbData,
    section,
    operationTypeInfo,
    address,
    mainSector,
  }: {
    section: BriefSectionKey;
    bdnbData: HubspotLocationBdnbData;
    operationTypeInfo: OperationSubTypeInfo;
    address: string;
    mainSector: MainSector;
  }) => {
    const ceeFile = getOperationTypeCeeFile(operationTypeInfo, mainSector);

    const prompt = `
      Voici les informations sur le projet:

      Adresse: ${address}

      BDNB Data:
      ${JSON.stringify(bdnbData, null, 4)}

      Types de travaux à financer: "${operationTypeInfo.label}"

      Fiches CEE applicables: "${ceeFile}"
    `;

    return OpenAIProvider.askAssistant({
      section,
      prompt,
    });
  },

  async generateLeadDetailsInsights({
    filters,
    lead,
  }: {
    filters: Record<string, unknown>;
    lead: Record<string, unknown>;
  }) {
    const schema = z.object({
      matchingReasons: z.array(z.string()),
      keyArguments: z.array(z.string()),
    });

    const input = JSON.stringify(
      {
        filters,
        lead,
      },
      null,
      2,
    );

    const currentThreadId = (await openai.beta.threads.create({})).id;

    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: input,
    });

    const run = await openai.beta.threads.runs.createAndPoll(currentThreadId, {
      assistant_id: LEAD_DETAILS_ASSISTANT_ID,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lead_details_insights",
          strict: true,
          schema: {
            type: "object",
            properties: {
              response: {
                type: "object",
                properties: {
                  matchingReasons: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  keyArguments: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                },
                required: ["matchingReasons", "keyArguments"],
                additionalProperties: false,
              },
            },
            required: ["response"],
            additionalProperties: false,
          },
        },
      },
    });

    const assistantMessages = await openai.beta.threads.messages.list(
      run.thread_id,
    );

    const message = assistantMessages.data
      .filter((m) => m.role === "assistant")
      .at(0);

    if (!message) {
      throw new Error("L'assistant n'a pas répondu");
    }

    const response =
      message.content
        .filter((c) => c.type === "text")
        ?.at(0)
        ?.text?.value?.replace(/【.*?】/g, "")
        ?.replace(/```/g, "") ?? null;

    if (!response) {
      throw new Error(
        "Aucune réponse renvoyée par l'assistant: leadDetailsInsights",
      );
    }

    let content;
    try {
      content = JSON.parse(response)?.response;
    } catch (e) {
      throw new Error(
        `Invalid JSON response from assistant leadDetailsInsights: ${e}`,
      );
    }

    const parsed = schema.safeParse(content);

    if (parsed.error || !parsed.data) {
      throw new Error(
        "L'assistant n'a pas renvoyé la réponse attendue:\n" +
          (formatZodError(parsed.error)?.errors?.join(", ") ??
            "Aucun contenu renvoyé."),
      );
    }

    return parsed.data;
  },

  async generateProspectionEmail(prompt: string): Promise<{
    subject: string;
    body: string;
  }> {
    const response = await openai.responses.create({
      model: "gpt-4o-mini", // ou autre modèle compatible structured outputs
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "b2b_prospection_email",
          schema: {
            type: "object",
            properties: {
              subject: {
                type: "string",
                description: "Email subject, max 60 characters.",
                maxLength: 60,
              },
              body: {
                type: "string",
                description:
                  "Full email body, 150–180 words, including the signature.",
              },
            },
            required: ["subject", "body"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    const raw = response.output_text;

    if (!raw) {
      throw new Error("No text response returned by the model.");
    }

    const result = z
      .object({
        subject: z.string(),
        body: z.string(),
      })
      .safeParse(JSON.parse(raw));

    if (!result.success) {
      throw new Error(
        `Model response does not match expected schema:\n${formatZodError(
          result.error,
        )}\nRaw: ${raw}`,
      );
    }

    return result.data;
  },
};
