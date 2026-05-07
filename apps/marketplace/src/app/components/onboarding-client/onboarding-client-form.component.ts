import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import type {
  LocationAddressDetails,
  LocationPlaceDetails,
} from "@optee/constants";
import { getOnboardingPath, ONBOARDING_OTP_PARAM } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { IconBoltComponent } from "@optee/icons";
import type { HubspotLocationBdnbData } from "@optee/models";
import { Location } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { unreachable } from "@optee/utils";
import { FloatLabel } from "primeng/floatlabel";
import { InputText } from "primeng/inputtext";
import trpcClient from "../../../trpc-client";
import { AppService } from "../../services/app.service";
import { LocationService } from "../../services/location.service";
import { TrackingService } from "../../services/tracking.service";
import { LocationShallowFormDialogComponent } from "../location/location-form-dialog/location-shallow-form-dialog.component";

@Component({
  selector: "mkp-onboarding-client-form",
  host: {
    class:
      "block bg-primary-700 relative mt-8 max-w-[600px] rounded-xl p-6 text-white",
  },
  template: `
    <form class="flex flex-col gap-4 lg:gap-6" [formGroup]="clientForm">
      <oui-form-field
        class="flex-1"
        name="companyName"
        darkMode
        [control]="clientForm.controls.companyName"
      >
        <p-floatlabel variant="in">
          <input
            id="companyName"
            darkMode
            fluid
            pInputText
            required
            type="text"
            [formControl]="clientForm.controls.companyName"
          />
          <label for="companyName">Nom de l'entreprise</label>
        </p-floatlabel>
      </oui-form-field>

      <oui-form-field
        class="flex-1"
        name="otp"
        darkMode
        [control]="clientForm.controls.otp"
      >
        <p-floatlabel variant="in">
          <input
            id="otp"
            darkMode
            fluid
            pInputText
            required
            type="text"
            [formControl]="clientForm.controls.otp"
          />
          <label for="otp">Code reçu par mail</label>
        </p-floatlabel>
      </oui-form-field>

      <oui-form-field
        class="flex-auto"
        name="selectedLocation"
        darkMode
        [control]="clientForm.controls.selectedLocationAddress"
      >
        <p-floatlabel variant="in">
          <input
            id="selectedLocationAddress"
            fluid
            pInputText
            required
            type="text"
            (click)="openLocationFormDialog($event)"
            [formControl]="clientForm.controls.selectedLocationAddress"
          />
          <label for="selectedLocationAddress">
            {{ locationLabel() }}
          </label>
        </p-floatlabel>
      </oui-form-field>

      <oui-button full size="large" variant="accent" (click)="onboardClient()">
        <icon-bolt class="size-6" />
        Finaliser mon inscription
      </oui-button>
    </form>
  `,
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    ButtonComponent,
    InputText,
    FloatLabel,
    IconBoltComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingClientFormComponent {
  locationLabel = input.required<string>();

  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly appService = inject(AppService);
  protected readonly toastService = inject(ToastService);
  protected readonly dialogService = inject(DialogService);
  protected readonly locationService = inject(LocationService);
  protected readonly trackingService = inject(TrackingService);

  readonly clientForm = new FormGroup({
    companyName: new FormControl("", {
      validators: [Validators.required],
      nonNullable: true,
    }),
    otp: new FormControl(
      this.route.snapshot.queryParams[ONBOARDING_OTP_PARAM] ?? "",
      {
        validators: [
          Validators.required,
          Validators.pattern(/^\d{6}$/), // Validates that OTP is exactly 6 digits
        ],
        nonNullable: true,
      },
    ),
    selectedLocationAddress: new FormControl("", {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  locationDto = signal<{
    addressData: LocationAddressDetails;
    placeData: LocationPlaceDetails;
    customBdnbData: HubspotLocationBdnbData;
  } | null>(null);

  async openLocationFormDialog(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    const { res: locationToCreate } = await this.dialogService.open(
      LocationShallowFormDialogComponent,
      { data: { mode: "shallow" } },
    );

    if (locationToCreate) {
      this.locationDto.set(locationToCreate);

      this.clientForm.patchValue({
        selectedLocationAddress: Location.makeAddress(
          locationToCreate.addressData,
        ),
      });
    }
  }

  async onboardClient() {
    const ctxMessage = "Accès plateforme";

    try {
      const location = this.locationDto();
      const client = this.clientForm.getRawValue();

      if (!client.companyName || !location) {
        this.clientForm.controls.companyName.markAsDirty();
        this.clientForm.controls.selectedLocationAddress.markAsDirty();
        this.clientForm.controls.otp.markAsDirty();

        throw new Error(
          "Le formulaire semble invalide. Veuillez vérifier les champs obligatoires.",
        );
      }

      const dto = {
        client: {
          companyName: client.companyName,
        },
        location,
        OTP: client.otp,
      };

      this.appService.isLoading.set(true);

      const onboardRes = await trpcClient.clients.onboard.mutate(dto);

      switch (onboardRes) {
        case "success": {
          this.locationService.refresh();

          await this.router.navigate(["/"]);

          this.toastService.open(
            "success",
            ctxMessage,
            "Vous avez désormais accès à votre dashboard personnalisé.",
          );

          this.trackingService.trackConversionSignup();

          break;
        }
        case "missing_contact": {
          this.toastService.open(
            "error",
            ctxMessage,
            "Merci de renseigner quelques informations sur vous afin d'accéder à la plateforme.",
          );

          await this.router.navigate([
            getOnboardingPath({ step: "contact", variant: "2025" }),
          ]);

          break;
        }
        case "invalid_otp": {
          this.toastService.open(
            "error",
            ctxMessage,
            "Le code reçu par mail est invalide. Veuillez vérifier votre boîte de réception.",
          );

          this.clientForm.controls.otp.setErrors({ invalid: true });
          this.clientForm.controls.otp.markAsDirty();

          break;
        }
        default: {
          unreachable(onboardRes);
        }
      }
    } catch (e) {
      this.toastService.openError(ctxMessage, e);
    } finally {
      this.appService.isLoading.set(false);
    }
  }
}
