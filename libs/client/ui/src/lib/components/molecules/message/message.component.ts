import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  IconErrorComponent,
  IconInfoComponent,
  IconLightbulbComponent,
  IconRefreshComponent,
  IconSuccessComponent,
  IconWarningComponent,
} from "@optee/icons";

type MessageDictionary = {
  [key in NotificationSeverity]: { color: string };
};

export const MESSAGE_DICTIONARY: MessageDictionary = {
  info: { color: "bg-primary-100 text-primary-700" },
  note: { color: "bg-purple-100  text-purple-900" },
  warn: { color: "bg-orange-100  text-orange-900" },
  error: { color: "bg-red-100 text-red-900" },
  success: { color: "bg-green-100  text-green-900" },
  loading: { color: "bg-primary-100 text-primary-700" },
};

export type NotificationSeverity =
  | "info"
  | "note"
  | "warn"
  | "error"
  | "success"
  | "loading";

@Component({
  selector: "oui-message",
  host: {
    class: "flex items-start justify-start rounded-2xl",
    "[class]": "messageClasses()",
  },
  template: `
    @if (showIcon()) {
      @switch (severity()) {
        @case ("info") {
          <icon-info class="mt-1 size-6 shrink-0" />
        }
        @case ("note") {
          <icon-lightbulb class="mt-1 size-6 shrink-0" />
        }
        @case ("warn") {
          <icon-warning class="mt-1 size-6 shrink-0" />
        }
        @case ("error") {
          <icon-error class="mt-1 size-6 shrink-0" />
        }
        @case ("success") {
          <icon-success class="mt-1 size-6 shrink-0" />
        }
        @case ("loading") {
          <icon-refresh class="mt-1 size-6 shrink-0 animate-spin" />
        }
      }
    }

    <div class="flex flex-col gap-1 p-1 text-sm">
      <span
        class="[&:not(:last-child)]:font-semibold"
        [innerHTML]="summary()"
      ></span>

      <div class="max-w-prose text-pretty">
        <ng-content />
      </div>
    </div>
  `,
  imports: [
    IconWarningComponent,
    IconSuccessComponent,
    IconLightbulbComponent,
    IconErrorComponent,
    IconInfoComponent,
    IconRefreshComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComponent {
  /** Primary message of the notification */
  readonly summary = input<string>("");

  /** Severity of the message, Defines the type of Notification to be displayed */
  readonly severity = input<NotificationSeverity>("info");

  /** Whether to display an icon before the message */
  readonly showIcon = input<boolean>(true);

  readonly compact = input(false, {
    transform: booleanAttribute,
  });

  readonly styleMode = input<"default" | "leads">("default");

  protected readonly messageColor = computed(() => {
    if (this.styleMode() === "leads") {
      switch (this.severity()) {
        case "info":
        case "loading":
          return "border border-amber-200 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900";
        case "note":
          return "border border-amber-200 bg-amber-50 text-amber-900";
        case "warn":
          return "border border-orange-200 bg-orange-50 text-orange-900";
        case "error":
          return "border border-red-200 bg-red-50 text-red-900";
        case "success":
          return "border border-green-200 bg-green-50 text-green-900";
      }
    }

    return MESSAGE_DICTIONARY[this.severity()].color;
  });

  protected readonly messageSpacing = computed(() => {
    return this.compact() ? "p-1 gap-1" : "p-4 gap-2";
  });

  protected readonly messageClasses = computed(() => {
    return this.messageSpacing() + " " + this.messageColor();
  });
}
