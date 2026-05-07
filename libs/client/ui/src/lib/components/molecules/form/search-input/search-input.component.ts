import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { IconSearchComponent } from "@optee/icons";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { debounceTime, distinctUntilChanged, map, tap } from "rxjs";

@Component({
  selector: "oui-search-input",
  host: {
    class: "inline-flex",
    "[class.w-full]": "full()",
    "[class.max-w-96]": "!full()",
  },
  template: `
    <p-iconfield class="max-w-full flex-[3]">
      <p-inputicon class="size-4">
        <icon-search />
      </p-inputicon>

      <input
        class="p-inputnumber-gray h-full"
        fluid
        pInputText
        role="searchbox"
        type="search"
        variant="filled"
        [(ngModel)]="debouncedSearchTerm"
        [placeholder]="placeholder()"
      />
    </p-iconfield>
  `,
  imports: [FormsModule, InputText, IconField, InputIcon, IconSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  readonly activeSearchTerm = model.required<string>();

  readonly placeholder = input("Rechercher par mot clé");
  readonly full = input(false, { transform: booleanAttribute });

  protected readonly debouncedSearchTerm = signal<string>("");

  private readonly syncDebouncedSearchTerm = toObservable(
    this.debouncedSearchTerm,
  )
    .pipe(
      map((v) => v.trim()),
      debounceTime(300),
      map((v) => (v.length >= 2 ? v : "")),
      distinctUntilChanged(),
      tap((v) => this.activeSearchTerm.set(v)),
      takeUntilDestroyed(),
    )
    .subscribe();

  private readonly reflectExternalActiveToInput = toObservable(
    this.activeSearchTerm,
  )
    .pipe(distinctUntilChanged(), takeUntilDestroyed())
    .subscribe((v) => this.debouncedSearchTerm.set(v ?? ""));
}
