import { ChangeDetectionStrategy, Component } from "@angular/core";
import { buildAssetUrl } from "@optee/constants";
import { Carousel } from "primeng/carousel";
import type { Testimonial } from "../testimonial-card/testimonial-card.component";
import { TestimonialCardComponent } from "../testimonial-card/testimonial-card.component";

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Agathe R.",
    intro: "Je gagne en moyenne plus de 3 heures par semaine grâce à Optee.",
    text: "L'accès à la plateforme Optee est 100 % gratuit. En tant que gestionnaire de plusieurs établissements, je peux centraliser mes besoins, identifier les travaux prioritaires, et recevoir des devis en quelques clics. Simple, efficace et sans risque.",
    avatar: buildAssetUrl("testimonials/agathe-r.png"),
  },
  {
    name: "Julien M.",
    intro:
      "Je récupère des projets plus rentables grâce aux simulations CEE d’Optee.",
    text: "En quelques clics, je peux estimer les subventions disponibles sur chaque projet et prioriser ceux avec un bon retour sur investissement. La projection énergétique et financière est claire, et ça m’a permis de convaincre mes clients plus rapidement. ",
    avatar: buildAssetUrl("testimonials/julien-m.png"),
  },
  {
    name: "Claire T.",
    intro:
      "Optee m’a fait gagner un temps fou dans le lancement de mes appels d’offres.",
    text: "Je gérais plusieurs bâtiments en parallèle et le temps passé à structurer les besoins et à consulter des prestataires explosait. Avec Optee, le brief technique est prêt en quelques minutes, et le réseau d’entreprises est de qualité.",
    avatar: buildAssetUrl("testimonials/claire-t.png"),
  },
  {
    name: "Romain D.",
    intro:
      "J’ai pu monter en compétence sur les enjeux énergétiques grâce à la plateforme.",
    text: "La plateforme m’aide à visualiser ce qui est faisable bâtiment par bâtiment, et à comprendre les priorités d’actions. C’est devenu un réflexe pour moi. Les fiches sont claires, pédagogiques, et m’aident à mieux argumenter.",
    avatar: buildAssetUrl("testimonials/romain-d.png"),
  },
  {
    name: "Jean-Yves P.",
    intro: "Je me repose à 100 % sur le réseau Optee pour la mise en relation.",
    text: "Avant, je ne savais pas toujours vers qui me tourner. Aujourd’hui, je reçois en quelques jours des devis d’entreprises qualifiées, déjà alignées sur le brief.",
    avatar: buildAssetUrl("testimonials/jeanyves-p.png"),
  },
];

@Component({
  selector: "oui-testimonial-carousel",
  template: `
    <p-carousel
      class="optee-carousel"
      circular
      [numScroll]="1"
      [numVisible]="3"
      [responsiveOptions]="responsiveOptions"
      [value]="testimonials"
    >
      <ng-template #item let-testimonial>
        <div class="h-full p-4">
          <oui-testimonial-card [testimonial]="testimonial" />
        </div>
      </ng-template>
    </p-carousel>
  `,
  imports: [TestimonialCardComponent, Carousel],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialCarouselComponent {
  testimonials = TESTIMONIALS;

  responsiveOptions = [
    {
      breakpoint: "950px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "650px",
      numVisible: 1,
      numScroll: 1,
    },
  ];
}
