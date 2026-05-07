import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { AccordionComponent } from "@optee/ui/components/molecules/accordion/accordion.component";
import { hostBinding } from "ngxtension/host-binding";

@Component({
  selector: "oui-questions",
  host: {
    class:
      "flex flex-col items-center justify-center gap-8 py-6 lg:py-12 xl:gap-16 relative",
    "[class]": "background()",
  },

  template: `
    <h2
      class="font-display text-primary-700 relative text-pretty text-center text-2xl font-semibold leading-snug lg:text-4xl"
      [class.text-white]="theme() === 'dark'"
    >
      J’ai d’autres questions sur Optee
    </h2>

    <div class="flex w-full max-w-screen-md flex-col gap-2">
      @for (item of ITEMS; track $index) {
        <oui-accordion
          class="p-soft z-10"
          (click)="updateVisibleIndex($index)"
          [isOpen]="$index === visibleIndex"
        >
          <div title>{{ item.question }}</div>
          {{ item.answer }}
        </oui-accordion>
      }
    </div>
  `,
  imports: [AccordionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsComponent {
  theme = input<"light" | "dark">("dark");
  background = computed(() =>
    this.theme() === "dark" ? "bg-primary-900" : "",
  );

  displayBinding = hostBinding("class", this.background);

  visibleIndex = 0;

  ITEMS = [
    {
      question: "Comment se rémunère Optee ?",
      answer:
        "L'accès à la plateforme Optee est gratuit. Les professionnels comme les propriétaires ou gestionnaires d'immeubles n'ont pas à payer pour y accéder et commencer un projet de mise en relation. Optee se rémunère directement sur les économies réalisées suite à l'optimisation financière, à travers un pourcentage du montant des travaux et des subventions.",
    },
    {
      question: "Que sont les certificats d’économies d’énergies (CEE) ?",
      answer:
        "Les Certificats d’Économies d’Énergie (CEE) sont des titres attribués pour des travaux visant à réduire la consommation d’énergie, comme l’isolation ou le remplacement d’équipements énergivores. Les fournisseurs d’énergie (EDF, Engie, etc.) ont l’obligation de collecter un certain nombre de ces certificats. Ils peuvent les obtenir en finançant des projets de rénovation énergétique ou en les achetant à ceux qui en génèrent (propriétaires, entreprises, etc.). S’ils ne respectent pas leurs obligations, ils sont soumis à des pénalités financières. Ce mécanisme incite à l’amélioration de l’efficacité énergétique des bâtiments.",
    },
    {
      question:
        "Comment sont sélectionnés les professionnels certifiés par Optee ?",
      answer:
        "Optee sélectionne des professionnels certifiés RGE à travers un processus KYC rigoureux, mené par des experts internes. Ce processus consiste à vérifier avec soin l’identité et la conformité des prestataires, en s’assurant qu’ils répondent aux exigences du label RGE. Cette vérification minutieuse et sécurisée garantit aux clients d’Optee des partenaires fiables et compétents, offrant ainsi une véritable valeur ajoutée dans leurs projets de rénovation énergétique.",
    },
    {
      question: "Quelles sont les sources de données utilisées par Optee ?",
      answer:
        "Optee utilise la base de Donnée Nationale du Bâtiment, les données de Enedis, GRDF et de l'ADEME ainsi que des bases de données internes pour enrichir l'analyse de vos bâtiments.",
    },
    {
      question: "Optee avance-t-il vraiment le montant des subventions ?",
      answer:
        "Optee estime précisément les subventions disponibles pour chaque opération. Cela permet au professionnel d'intégrer le montant des aides dans son devis et de ne demander au client que le montant restant des travaux. Une fois l'opération terminée, Optee agit comme un tiers, mandataire sécurisé, récupère les CEE et les verse directement au professionnel.",
    },
  ];

  updateVisibleIndex(index: number): void {
    this.visibleIndex = this.visibleIndex === index ? -1 : index;
  }
}
