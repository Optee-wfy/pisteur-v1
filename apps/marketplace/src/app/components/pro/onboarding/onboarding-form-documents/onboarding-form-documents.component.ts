import type { WritableSignal } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import type { ProFileMetadata } from "@optee/constants";
import {
  buildAssetUrl,
  PRO_FILES_METADATA,
  PRO_WITH_CEE_FILES_METADATA,
} from "@optee/constants";
import { IconSpinnerComponent } from "@optee/icons";
import type { InputProWithoutIds } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import type { FileDto } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { DropzoneComponent } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { FileService } from "@optee/ui/services/file.service";
import { ToastService } from "@optee/ui/services/toast.service";
import trpcClient from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";

type ProFileMetadataHydrated = ProFileMetadata & {
  files: WritableSignal<FileDto[]>;
};

@Component({
  selector: "mkp-pro-onboarding-form-documents",
  host: {
    class: "flex flex-col items-start gap-10",
  },
  template: `
    <div class="flex flex-col items-start justify-center gap-2">
      <h1 class="text-2xl font-semibold">Documents légaux</h1>
      <p class="text-sm text-gray-600">
        Importez les documents légaux de votre entreprise. Une fois tous les
        documents importés, nous procéderons à leur vérification.
      </p>
    </div>

    <div
      class="bg-primary-200 flex max-w-screen-sm flex-col items-center gap-2 rounded-2xl px-6 py-3"
    >
      <p>
        💡
        <b>Important</b>
        : Veuillez déposer un seul fichier par document requis.
      </p>
      <p>
        Si vous avez plusieurs fichiers, vous pouvez les regrouper à l’aide d’un
        outil comme
        <a
          class="border-b border-black"
          href="https://www.ilovepdf.com/fr"
          rel="noopener"
          target="_blank"
        >
          <span>ILovePDF</span>
        </a>
        avant de les transmettre.
      </p>
    </div>
    <form class="flex w-full flex-col gap-6" (ngSubmit)="onSubmit()">
      @for (file of filesWithMetaData(); track $index) {
        @if (
          file.label !== "rge" ||
          (file.label === "rge" && this.pro()?.eligibilityCee)
        ) {
          <div class="flex flex-col gap-2">
            <div class="flex flex-col items-start">
              <h4 class="text-primary-940 text-sm font-medium">
                {{ file.title }}
              </h4>
              @if (file.subtitle) {
                <span class="text-xs text-gray-600">{{ file.subtitle }}</span>
              }
            </div>

            <oui-dropzone
              compact
              showMaxFileSize
              (filesChanged)="file.files.set($event)"
              [extensions]="['.pdf']"
              [maxFileSize]="20"
              [multiple]="file.multiple"
              [required]="file.required"
            />

            @if (file.hasModel) {
              <button
                class="text-primary-700 w-fit text-sm underline"
                type="button"
                (click)="downloadFile(file.label)"
              >
                Télécharger un modèle
              </button>
            }
          </div>
        }
      }
      <p class="text-sm text-gray-600">
        Fichiers acceptés : .pdf avec un poids de 20 Mo maximum.
      </p>
      <oui-button type="submit" variant="primary" [disabled]="!canSubmit()">
        @if (uploading()) {
          <icon-spinner
            class="size-4 animate-spin text-transparent"
            colorMode="colored"
          />
        }
        Créer mon compte
      </oui-button>
    </form>
  `,
  imports: [
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    DropzoneComponent,
    IconSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingProFormDocumentsComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly fileService = inject(FileService);
  protected readonly router = inject(Router);
  protected readonly proService = inject(ProService);

  pro = input<InputProWithoutIds | null>();
  uploading = signal(false);

  filesWithMetaData = computed<ProFileMetadataHydrated[]>(() => {
    const filesMetaData = this.pro()?.eligibilityCee
      ? PRO_WITH_CEE_FILES_METADATA
      : PRO_FILES_METADATA;
    return filesMetaData.map((filesMetaData) => ({
      ...filesMetaData,
      files: signal<FileDto[]>([]),
    }));
  });

  canSubmit = computed(
    () =>
      !this.uploading() &&
      this.filesWithMetaData().every(
        (fileWithMetaData) =>
          !fileWithMetaData.required ||
          (fileWithMetaData.required && fileWithMetaData.files().length > 0),
      ),
  );

  async onSubmit(): Promise<void> {
    this.uploading.set(true);
    const contextMessage = "Mise à jour de votre profil d'entreprise";
    const proName = this.pro()?.name;
    if (!proName) {
      return;
    }

    try {
      await Promise.all(
        this.filesWithMetaData().map(async (fileWithMetaData) => {
          const fileDto = fileWithMetaData.files()[0];
          if (!fileDto) {
            return;
          }

          const label =
            fileWithMetaData.label === "autres"
              ? `Autres - ${fileDto.name}`
              : fileWithMetaData.label;

          fileDto.name = `[${proName}] ${label}`;

          await trpcClient.pros.upload.mutate({
            file: fileDto,
            label: fileWithMetaData.label,
          });
        }),
      );

      this.toastService.open(
        "success",
        contextMessage,
        "Les informations ont été enregistrées",
      );

      await trpcClient.pros.updateStatus.mutate(
        "En attente de signature plateforme",
      );
      this.proService.refresh();

      this.router.navigate(["/pro/onboarding/onboarding-sign"]);
    } catch (error) {
      this.uploading.set(false);
      this.toastService.openError(contextMessage, error);
    }
  }

  downloadFile(label: "dbe-s-1" | "dbe-s-2") {
    const filePath = `pdf/${label}.pdf` as const;

    const publicAssetPath = buildAssetUrl(filePath);

    this.fileService.downloadFileFromUrl(publicAssetPath, `${label}.pdf`);
  }
}
