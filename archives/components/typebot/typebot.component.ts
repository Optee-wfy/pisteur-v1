import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  input,
  Output,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { isNotNullish } from "@optee/utils";
import { z } from "zod";
// @ts-expect-error tofix
import Typebot from "@typebot.io/js/web";
import { combineLatest, filter } from "rxjs";

const TypebotActionSchema = z.object({
  action: z.literal("setVariable"),
  variableName: z.string(),
  value: z.unknown(),
});

export type TypebotAction = z.infer<typeof TypebotActionSchema>;

export type TypebotVariable = {
  name: string;
  value:
    | string
    | number
    | Record<string, string | number | object>
    | Array<string | number | object>;
};

@Component({
  selector: "mkp-typebot",
  host: {
    class: "block",
  },
  template: `
    <typebot-standard #typebot />
  `,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypebotComponent {
  @Output() variableSet = new EventEmitter<TypebotVariable>();

  typebotId = input.required<string>();

  prefilledVariables = input<Record<string, unknown>>({});

  typebotEl = viewChild<Typebot>("typebot");

  subTypebot = combineLatest([
    toObservable(this.typebotId),
    toObservable(this.prefilledVariables),
    toObservable(this.typebotEl).pipe(filter(isNotNullish)),
  ])
    .pipe(takeUntilDestroyed())
    .subscribe(([id, prefilledVariables]) => {
      Typebot.initStandard({
        typebot: id,
        prefilledVariables,
        // onNewInputBlock: (inputBlock: unknown) => {
        //   console.log("LOG onNewInputBlock", inputBlock);
        // },
        // onAnswer: (answer: { message: string; blockId: string }) => {
        //   console.log("LOG onAnswer", answer);
        // },
        // onInit: () => {
        //   console.log("LOG onInit");
        // },
        // onEnd: () => {
        //   this.botEnd.emit();
        // },
        onNewLogs: (
          logs: {
            status: string;
            description: string;
            details?: unknown;
          }[],
        ) => {
          console.log("onNewLogs", logs);
        },
        // onChatStatePersisted: (isEnabled: boolean) => {
        //   console.log("onChatStatePersisted", isEnabled);
        // },
        onScriptExecutionSuccess: (res: string) => {
          try {
            const parsedRes = JSON.parse(res);

            const { action, ...typebotAction } =
              TypebotActionSchema.parse(parsedRes);

            if (action === "setVariable") {
              this.variableSet.emit({
                name: typebotAction.variableName,
                value:
                  typeof typebotAction.value === "string"
                    ? safeJsonParse(typebotAction.value)
                    : typebotAction.value,
              });
            }
          } catch (error) {
            console.error(error);
          }
        },
      });
    });
}

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return str;
  }
}
