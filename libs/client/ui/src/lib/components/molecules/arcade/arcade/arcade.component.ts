import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "oui-arcade",
  host: {
    class: "relative block",
  },
  template: `
    <iframe
      class="absolute inset-0 size-full"
      allow="clipboard-write"
      allowfullscreen
      frameborder="0"
      loading="lazy"
      mozallowfullscreen
      webkitallowfullscreen
      [attr.src]="src()"
    ></iframe>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArcadeComponent {
  flowId = input.required<string>();
  showCopyLink = input(false, { transform: booleanAttribute });

  sanitizer = inject(DomSanitizer);

  src = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://demo.arcade.software/${this.flowId()}?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=${this.showCopyLink() ? "true" : "false"}`,
    ),
  );
}
