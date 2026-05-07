import { inject, Injectable } from "@angular/core";
import { AuthApiError, AuthError } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private readonly messageService = inject(MessageService);

  open(
    severity: "success" | "error" | "info" | "warn",
    summary: string,
    detail: string,
  ) {
    this.messageService.add({ severity, summary, detail });
  }

  openError(actionAttempted: string, err: unknown) {
    const header = `Une erreur est survenue lors de ${actionAttempted}.`;

    if (err instanceof Error && err.message === "This operation was aborted.") {
      return; // Silencieusement ignorer les opérations annulées
    }

    if (err instanceof Error && err.stack) {
      console.error(`${header}: ${err.message}\n${err.stack}`);
    } else {
      console.error(header, err);
    }

    if (typeof err === "string") {
      this.open("error", actionAttempted, err);
    } else {
      const message =
        err instanceof Error ||
        err instanceof TRPCError ||
        err instanceof AuthApiError ||
        err instanceof AuthError
          ? err.message
          : "Une erreur inconnue est survenue. Nos équipes ont été notifiées.";

      this.open("error", actionAttempted, message);
    }
  }
}
