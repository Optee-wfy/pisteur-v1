import type { ToastService } from "@optee/ui/services/toast.service";
import { TRPCClientError } from "@trpc/client";
import type { Observable } from "rxjs";
import { of } from "rxjs";
import { catchError } from "rxjs/operators";
import { SupabaseService } from "../supabase.service";

export function handleError<T, F>(
  toastService: ToastService,
  actionAttempted: string,
  fallbackValue: F,
) {
  return (source$: Observable<T | F>) => {
    return source$.pipe(
      catchError((err: unknown) => {
        console.log({ err, type: typeof err });
        if (
          err instanceof TRPCClientError &&
          err.data.code === "UNAUTHORIZED"
        ) {
          SupabaseService.clearLocalStorageAuthTokens();
          location.reload();
        } else {
          toastService.openError(actionAttempted, err);
        }
        return of(fallbackValue); // Ou une valeur par défaut pour continuer le flux
      }),
    );
  };
}
