import { NgTemplateOutlet } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { buildAssetUrl, type SocialNetwork } from "@optee/constants";
import { IconArrowComponent, IconSocialComponent } from "@optee/icons";
import { InputText } from "primeng/inputtext";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "swc-footer",
  host: {
    class:
      "flex flex-col items-center mx-auto w-full bg-primary-900 text-white divide-y px-8 xl:px-0",
  },
  template: `
    <div
      class="content-centered flex flex-wrap justify-center gap-10 py-6 xl:gap-16 xl:py-12 print:hidden"
    >
      <div class="flex w-full flex-col items-start gap-6 md:max-w-sm lg:w-auto">
        <img class="h-8" alt="logo" [src]="logoDark" />
        <p class="text-white">
          Optee est la plateforme de pilotage d’opérations de rénovation
          énergétique pour les professionnels
        </p>
        <div class="flex items-center gap-5">
          @for (social of socials; track social.slug) {
            <a
              class="flex items-center text-white"
              rel="noopener"
              target="blank"
              [href]="social.href"
            >
              <icon-social class="size-5" [socialNetwork]="social.slug" />
            </a>
          }
        </div>

        <h4 class="font-semibold">Inscrivez-vous à notre newsletter</h4>
        <div class="relative w-72">
          <input
            class="text-primary-100 placeholder:text-primary-100 border-primary-200 h-10 w-full rounded-xl border bg-transparent px-6 shadow placeholder:opacity-100"
            id="email"
            name="email"
            pInputText
            placeholder="Adresse e-mail"
            required
            type="email"
            [formControl]="newsletterControl"
          />
          <button
            class="text-primary-100 absolute right-4 top-0 inline-flex h-10 items-center justify-center gap-1"
            type="submit"
            (click)="submitNewsletterControl()"
          >
            <icon-arrow class="size-4" />
          </button>

          @if (newsletterControl.errors && newsletterControl.errors["email"]) {
            <ng-container ngProjectAs="errors">
              L'email est invalide.
            </ng-container>
          }
        </div>
      </div>

      <div
        class="flex flex-1 flex-wrap justify-center gap-6 md:flex-nowrap xl:gap-14"
      >
        @for (column of sitemap; track column.label) {
          <div class="flex min-w-fit flex-1 flex-col gap-6 xl:gap-10">
            <h4 class="font-bold">{{ column.label }}</h4>
            <div class="flex flex-col gap-4">
              @for (item of column.children; track item.label) {
                <ng-container *ngTemplateOutlet="sitemapLink" />

                <ng-template #sitemapLink>
                  <a class="max-w-44" [href]="item.href">
                    {{ item.label }}
                  </a>
                </ng-template>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <div
      class="content-centered flex flex-wrap justify-between gap-4 py-4 text-xs xl:gap-2"
    >
      <div class="flex flex-col items-center gap-4 xl:flex-row xl:gap-8">
        <img class="size-24 xl:size-32" alt="logo" [src]="lemonwayLogo" />
        <p class="text-white">
          Agent de
          <a
            class="underline"
            href="https://www.lemonway.com/"
            rel="noopener"
            target="_blank"
          >
            Lemonway
          </a>
          (établissement de paiement dont le siège social est situé au 8, rue du
          Sentier 75002 Paris, agréé par l’ACPR sous le numéro 16568) inscrit au
          <a
            class="underline"
            href="https://www.regafi.fr/spip.php?rubrique1"
            rel="noopener"
            target="_blank"
          >
            Registre des agents financiers
          </a>
          (Regafi)
        </p>
      </div>
      <div>Copyright Optee 2024</div>

      <div class="flex flex-wrap gap-2 divide-x-2">
        <span class="xl:px-2">Tous droits réservés</span>
        <a class="px-2" routerLink="politique-de-confidentialite">
          Politique de confidentialité
        </a>
      </div>
    </div>
  `,
  imports: [
    NgTemplateOutlet,
    InputText,
    RouterModule,
    ReactiveFormsModule,
    IconSocialComponent,
    IconArrowComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly http = inject(HttpClient);

  socials: Array<{ slug: SocialNetwork; href: string }> = [
    {
      slug: "linkedin",
      href: "https://www.linkedin.com/company/optee",
    },
  ];

  logoDark = buildAssetUrl("logo-dark-theme.svg");
  lemonwayLogo = buildAssetUrl("lemonway-logo.svg");

  sitemap: Array<{
    label: string;
    children: Array<{ label: string; href: string }>;
  }> = [
    {
      label: "Vous êtes ?",
      children: [
        {
          label: "Propriétaire",
          href: "",
        },
        {
          label: "Architecte",
          href: "architecte",
        },
        {
          label: "Professionnel",
          href: "professionnel",
        },
      ],
    },
    {
      label: "Opérations",
      children: [
        { label: "Isolation", href: "isolation" },
        // { label: "Éclairage", href: "eclairage" },
        { label: "GTB", href: "gtb" },
        { label: "CVC", href: "cvc" },
        { label: "Audit", href: "audit" },
      ],
    },
    // {
    //   label: "Conformité",
    //   children: [
    //     { label: "BAACS", href: "#" },
    //     { label: "Tertiaire", href: "#" },
    //     { label: "RSE", href: "#" },
    //   ],
    // },
    {
      label: "Informations",
      children: [
        // { label: "À propos", href: "#" },
        {
          label: "Carrières",
          href: "https://www.welcometothejungle.com/fr/companies/optee",
        },
        // { label: "Clients", href: "#" },
        // { label: "Blog", href: "#" },
      ],
    },
    {
      label: "Contact",
      children: [
        {
          label: "contact@optee.io",
          href: "mailto:contact@optee.io",
        },
        // { label: "01 23 45 67 89", href: "tel:0123456789", icon: "call" },
        {
          label: "81 rue de Monceau 75008 - Paris",
          href: "https://maps.app.goo.gl/sXnKw1SK59Y9m29X7",
        },
      ],
    },
  ];

  newsletterControl = new FormControl("", [
    Validators.required,
    Validators.email,
  ]);

  async submitNewsletterControl() {
    if (!this.newsletterControl.valid) {
      return;
    }
    const apiUrl =
      "https://api.hsforms.com/submissions/v3/integration/submit/144886321/4248b87b-f21a-4dc5-aaa7-a43e1f95d224";

    const body = {
      fields: [{ name: "email", value: this.newsletterControl.value }],
      context: {
        pageUri: window.location.href,
        pageName: document.title,
      },
    };

    try {
      const response = await firstValueFrom(
        this.http.post<{ redirectUri: string }>(apiUrl, body),
      );

      if (response.redirectUri) {
        window.location.href = response.redirectUri;
      }
    } catch (e) {
      return;
    }
  }
}
