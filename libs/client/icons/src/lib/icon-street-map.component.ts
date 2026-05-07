import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-street-map",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M19 3.16675C26.4639 3.16675 30.1959 3.16675 32.5146 5.48549C33.3124 6.28328 33.8357 7.24836 34.179 8.47519L8.47513 34.179C7.2483 33.8358 6.28322 33.3125 5.48543 32.5147C3.16669 30.1959 3.16669 26.464 3.16669 19.0001C3.16669 11.5362 3.16669 7.80422 5.48542 5.48549C7.80416 3.16675 11.5361 3.16675 19 3.16675ZM8.70835 13.8658C8.70835 16.6919 10.4771 19.9896 13.2366 21.1689C13.8799 21.4438 14.6201 21.4438 15.2634 21.1689C18.023 19.9896 19.7917 16.6919 19.7917 13.8658C19.7917 11.0175 17.3106 8.70842 14.25 8.70842C11.1894 8.70842 8.70835 11.0175 8.70835 13.8658Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="M16.625 14.2501C16.625 15.5618 15.5617 16.6251 14.25 16.6251C12.9383 16.6251 11.875 15.5618 11.875 14.2501C11.875 12.9384 12.9383 11.8751 14.25 11.8751C15.5617 11.8751 16.625 12.9384 16.625 14.2501Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <g opacity="0.5">
        <path
          d="M34.6581 11.3555C34.8337 13.3529 34.8337 15.8426 34.8337 19.0004C34.8337 25.5453 34.8337 29.2207 33.2702 31.5899L23.8471 22.1667L34.6581 11.3555Z"
          [class]="
            colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
          "
        />
        <path
          d="M31.5911 33.2695L22.1677 23.8461L11.3555 34.6581C13.3528 34.8337 15.8426 34.8337 19.0003 34.8337C25.5464 34.8337 29.2219 34.8337 31.5911 33.2695Z"
          [class]="
            colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
          "
        />
      </g>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconStreetMapComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
