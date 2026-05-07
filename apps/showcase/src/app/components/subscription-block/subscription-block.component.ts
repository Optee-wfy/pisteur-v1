import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  CTA,
  FEATURES,
  hasFeature,
  ProSubscription,
  SUBSCRIPTION_LABELS,
  SUBSCRIPTIONS,
} from "@optee/constants";
import { IconSuccessComponent, IconXmarkComponent } from "@optee/icons";
import { DemoButtonComponent } from "@optee/ui/components/atoms/button/demo-button/demo-button.component";
import { DividerHorizontalComponent } from "@optee/ui/components/atoms/divider/divider-horizontal/divider-horizontal.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
@Component({
  selector: "swc-subscription-block",
  host: {
    class:
      "flex flex-col gap-6 lg:gap-20 rounded-2xl bg-white px-6 py-10 lg:items-center",
  },
  template: `
    <h3
      class="font-display text-primary-700 text-center text-2xl font-bold leading-snug lg:text-4xl"
    >
      <strong>Choisissez</strong>
      l'abonnement qui
      <span class="bg-green-500"><strong>accélère votre activité</strong></span>
    </h3>
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
      <div
        class="font-display text-primary-700 hidden flex-col gap-4 text-lg lg:mt-10 lg:flex lg:w-96 lg:text-xl"
      >
        @for (feature of FEATURES; let i = $index; track feature.key) {
          <span [innerHTML]="feature.label"></span>
          @if (featuresKeyDivider.includes(feature.key)) {
            <oui-divider-horizontal class="hidden shrink-0 md:block" />
          }
        }
      </div>

      <div
        class="font-display flex w-full flex-auto flex-col items-center gap-6 lg:w-auto lg:flex-row lg:gap-4"
      >
        @for (sub of SUBSCRIPTIONS; let i = $index; track sub.type) {
          <div class="flex flex-col items-center gap-4 sm:min-w-72">
            <oui-eve
              class="!text-primary-700 flex flex-col gap-4 self-stretch text-center lg:items-center"
            >
              <div class="flex h-20 flex-col gap-2">
                <div class="text-xl font-bold lg:text-2xl">
                  {{ LABELS[sub.type] }}
                </div>
                <div class="text-lg lg:text-xl">
                  <span class="font-bold">{{ sub.pricePerMonth }} €</span>
                  / mois
                </div>
              </div>
              @for (
                feature of visibleFeatures;
                let j = $index;
                track feature.key
              ) {
                @if (hasFeature(sub, feature.key)) {
                  <div class="flex gap-4">
                    <icon-success class="size-7" colorMode="colored" />
                    <div class="flex lg:hidden">
                      <span [innerHTML]="feature.label"></span>
                    </div>
                  </div>
                } @else {
                  <div class="flex gap-4">
                    <icon-xmark class="size-7 text-red-500" />
                    <div class="flex lg:hidden">
                      <span [innerHTML]="feature.label"></span>
                    </div>
                  </div>
                }

                @if (featuresKeyDivider.includes(feature.key)) {
                  <oui-divider-horizontal class="hidden shrink-0 md:block" />
                }
              }

              <div>
                @if (sub.connections) {
                  <span class="font-bold">{{ sub.connections }}</span>
                  @if (sub.connections > 1) {
                    mises en relation
                  } @else {
                    mise en relation
                  }
                } @else {
                  <span class="hidden font-bold lg:block">-</span>
                  <span class="block lg:hidden">0 mise en relation</span>
                }
              </div>
              <div class="flex flex-col gap-0">
                <div>
                  <span class="font-bold">{{ sub.pricePerLead }} €</span>
                  / Lead
                </div>
                @if (sub.leadTerms) {
                  <span class="h-0 text-sm italic">{{ sub.leadTerms }}</span>
                }
              </div>
            </oui-eve>
            <oui-demo-button [label]="CTA.makeAnAppointment" />
          </div>
        }
      </div>
    </div>
  `,
  imports: [
    EveComponent,
    DemoButtonComponent,
    DividerHorizontalComponent,
    IconSuccessComponent,
    IconXmarkComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionBlockComponent {
  protected readonly SUBSCRIPTIONS = SUBSCRIPTIONS.filter(
    (sub) => sub.type === ProSubscription.IMPACT,
  );

  protected readonly LABELS = SUBSCRIPTION_LABELS;
  protected readonly FEATURES = FEATURES;
  protected readonly CTA = CTA;
  protected readonly hasFeature = hasFeature;

  protected readonly featuresKeyDivider = ["simulator", "mailDirect"];
  protected readonly visibleFeatures = this.FEATURES.filter(
    (feature) => feature.key !== "leadCost" && feature.key !== "bizDev",
  );
}
