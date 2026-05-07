import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ExternalContactsTableComponent } from "../../../../../feats/prospect/components/external-contacts/external-contacts-table/external-contacts-table.component";

@Component({
  selector: "mkp-address-book-external-contacts-page",
  host: { class: "h-screen" },
  template: `
    <mkp-external-contacts-table [emptyListMessage]="emptyListMessage" />
  `,
  imports: [ExternalContactsTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressBookExternalContactsPage {
  protected readonly emptyListMessage = `Aucun contact dans votre carnet d'adresses. Ajoutez des personnes pour les retrouver facilement lors de vos prochaines recherches.`;
}
