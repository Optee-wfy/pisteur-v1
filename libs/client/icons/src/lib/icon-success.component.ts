import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-success",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="13.9993"
        cy="13.9993"
        r="13.3333"
        [class]="colorMode() === 'colored' ? 'fill-[#D6F7E8]' : 'fill-current'"
      />
      <path
        clip-rule="evenodd"
        d="M20.3199 8.88402C20.4162 8.9636 20.4959 9.06138 20.5545 9.17177C20.613 9.28216 20.6492 9.403 20.6611 9.52739C20.6729 9.65178 20.6601 9.77729 20.6235 9.89674C20.5868 10.0162 20.527 10.1273 20.4474 10.2236L12.7982 19.4806L12.7954 19.4825C12.6214 19.6915 12.4031 19.8591 12.1562 19.9731C11.9094 20.0872 11.6402 20.1448 11.3683 20.1418C11.092 20.1383 10.8201 20.0722 10.5729 19.9487C10.3258 19.8251 10.1098 19.6472 9.9412 19.4282L7.54561 16.3495C7.46563 16.2513 7.40607 16.1381 7.37043 16.0165C7.3348 15.8949 7.32381 15.7674 7.33811 15.6415C7.35241 15.5156 7.39171 15.3939 7.4537 15.2834C7.5157 15.1729 7.59914 15.0759 7.69913 14.9981C7.79911 14.9203 7.91364 14.8632 8.03597 14.8303C8.15831 14.7973 8.286 14.7891 8.41154 14.8062C8.53708 14.8232 8.65795 14.8652 8.76706 14.9296C8.87617 14.994 8.97131 15.0796 9.0469 15.1812L11.3911 18.1943L18.9794 9.01151C19.0589 8.91517 19.1567 8.83545 19.2671 8.77691C19.3775 8.71836 19.4983 8.68213 19.6227 8.6703C19.7471 8.65846 19.8726 8.67124 19.9921 8.70791C20.1115 8.74458 20.2226 8.80443 20.3189 8.88402H20.3199Z"
        fill-rule="evenodd"
        [class]="colorMode() === 'colored' ? 'fill-[#098900]' : 'fill-white'"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSuccessComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
