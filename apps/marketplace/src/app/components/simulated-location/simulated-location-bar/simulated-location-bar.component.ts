import { NgxGpAutocompleteModule } from "@angular-magic/ngx-gp-autocomplete";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { InputText } from "primeng/inputtext";

@Component({
  selector: "mkp-simulated-location-bar",
  host: {
    class:
      "bg-primary-700 pl-8 pr-3 py-3 rounded-2xl flex justify-between items-center text-white",
  },
  template: `
    <div class="font-display text-lg">
      <span class="font-semibold">Simulez</span>
      vos opérations
    </div>

    <div class="flex gap-3">
      <div class="w-96">
        <input
          #placesRef="ngx-places"
          fluid
          ngx-gp-autocomplete
          pInputText
          placeholder="Entrez l'adresse d'un site"
          (onAddressChange)="handleAddressChange($event)"
          [(ngModel)]="addressField"
          [options]="{
            componentRestrictions: { country: 'fr' },
          }"
        />
      </div>

      <oui-button class="w-40" full variant="litePrimary">Démarrer</oui-button>
    </div>
  `,
  imports: [ButtonComponent, NgxGpAutocompleteModule, InputText, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatedLocationBarComponent {
  addressField = signal("");

  async handleAddressChange(place: google.maps.places.PlaceResult) {
    console.log({ place });
  }
}
