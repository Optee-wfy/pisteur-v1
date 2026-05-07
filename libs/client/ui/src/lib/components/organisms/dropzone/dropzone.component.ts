import { NgTemplateOutlet } from "@angular/common";
import type { ElementRef } from "@angular/core";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { IconUploadFileComponent, IconXmarkComponent } from "@optee/icons";
import { isHTMLInputElement } from "@optee/ui/utils/is/is-html-input/is-html-input.fn";
import { isNotNullish } from "@optee/utils";
import { filter, map, shareReplay, switchMap, tap } from "rxjs";
import { fromEvent } from "rxjs-zone-less";
import { FileService } from "@optee/ui/services/file.service";
import { ToastService } from "@optee/ui/services/toast.service";

type SupportedExtension = ".csv" | ".pdf";

export type FileDto = {
  name: string;
  type: string;
  data: string /* Base 64 encoded data */;
  file: File;
};

@Component({
  selector: "oui-dropzone",
  template: `
    @if (currentFiles().length === 0) {
      <div>
        <label
          class="relative flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-all hover:bg-gray-100"
          [class.h-64]="!compact()"
          [class.py-1]="compact()"
        >
          <div
            class="text-primary-700 dark:text-primary-400 flex flex-col items-center justify-center pt-1.5"
            [class.py-6]="!compact()"
          >
            <ng-content />

            <p
              class="text-primary-700 mb-2 text-xs underline underline-offset-2 lg:text-sm"
            >
              Glissez/déposez ou choisissez un fichier à importer
            </p>
          </div>
          <input
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            id="dropzone-file"
            #FileInput
            type="file"
            [accept]="acceptedExtensions()"
            [multiple]="multiple()"
            [required]="required()"
          />
        </label>
        @if (shouldShowExtensionsOrSize()) {
          <div class="mt-2 flex items-center justify-between">
            @if (showExtensions()) {
              <p class="mt-1 text-xs">
                Extensions acceptées:
                @for (extension of extensions(); track $index) {
                  <span class="rounded bg-gray-300 px-2">{{ extension }}</span>
                }
              </p>
            }
            @if (maxFileSize() && showMaxFileSize()) {
              <p class="text-xs">Taille maximale: {{ maxFileSize() }} Mo</p>
            }
          </div>
        }
      </div>
    } @else {
      @let plural = currentFiles().length > 1 ? "s" : "";

      @if (multiple()) {
        <p class="mb-2 mt-3">Fichier{{ plural }} ajouté{{ plural }}</p>
      }
      <div *ngTemplateOutlet="fileUploaded"></div>
    }

    <ng-template #fileUploaded>
      <div
        class="border-primary-200 flex max-h-44 w-full flex-col overflow-auto rounded-2xl border"
      >
        @for (file of currentFiles(); track $index) {
          <div
            class="hover:bg-primary-200 bg-primary-50 flex items-center justify-start gap-2 px-4 py-2"
          >
            <icon-upload-file class="size-5" />
            <span>
              {{
                file.name.length > filesNamesMaxLength()
                  ? file.name.slice(0, filesNamesMaxLength()) + "..."
                  : file.name
              }}
            </span>
            <icon-xmark
              class="ml-auto size-5 cursor-pointer text-red-500"
              (click)="removeFile($index)"
            />
          </div>
        }
      </div>
    </ng-template>
  `,
  imports: [IconUploadFileComponent, IconXmarkComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropzoneComponent {
  extensions = input.required<SupportedExtension[]>();
  maxFileSize = input<number>();
  filesNamesMaxLength = input(50);
  multiple = input(false, { transform: booleanAttribute });
  compact = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });
  showExtensions = input(false, { transform: booleanAttribute });
  showMaxFileSize = input(false, { transform: booleanAttribute });

  filesChanged = output<FileDto[]>();

  private readonly toastService = inject(ToastService);
  private readonly fileService = inject(FileService);

  protected readonly currentFiles = signal<FileDto[]>([]);

  protected readonly shouldShowExtensionsOrSize = computed(
    () =>
      this.multiple() ||
      (this.currentFiles().length === 0 &&
        (this.showExtensions() || this.showMaxFileSize())),
  );

  protected readonly acceptedExtensions = computed(() =>
    this.extensions().join(", "),
  );

  private readonly inputEl = viewChild<ElementRef>("FileInput");

  private readonly selectedFileSubscription = toObservable(this.inputEl)
    .pipe(
      filter((input) => !!input),
      switchMap((input) =>
        fromEvent<InputEvent>(input.nativeElement, "change"),
      ),
      map(({ target }) => target),
      filter(isHTMLInputElement),
      map((target) => target.files),
      filter(isNotNullish),
      // @todo filter by file extension with `isCSV` or `isPdf` helper
      map((fileList) => {
        const maxSize = this.maxFileSize();
        const files = Array.from(fileList);
        if (!maxSize) {
          return files;
        }
        const filtered = files.filter(
          (file) => file.size <= maxSize * 1024 * 1024,
        );
        if (filtered.length !== files.length) {
          this.toastService.open(
            "error",
            "Ajout de fichier(s)",
            `Certains fichiers sont trop volumineux. Taille maximale: ${maxSize} Mo`,
          );
        }
        return filtered;
      }),
      shareReplay(1),
      tap((files) => {
        this.addFiles(files);
      }),
      takeUntilDestroyed(),
    )
    .subscribe();

  protected async addFiles(files: File[]) {
    const currentFiles = this.multiple() ? this.currentFiles() : [];

    const newFile = await Promise.all(
      Array.from(files).map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await this.fileService.toBase64(file),
        file,
      })),
    );
    const newFiles = [...currentFiles, ...newFile];

    this.currentFiles.set(newFiles);
    this.filesChanged.emit(newFiles);
  }

  protected removeFile(index: number) {
    const currentFiles = this.currentFiles();
    currentFiles.splice(index, 1);
    this.currentFiles.set(currentFiles);
    this.filesChanged.emit(currentFiles);
  }
}
