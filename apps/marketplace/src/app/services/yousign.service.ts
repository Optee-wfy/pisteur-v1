import { Injectable } from "@angular/core";
import type { YouSignRequestId } from "@optee/constants";
import { isSignatureDone } from "@optee/constants";
import { sleep } from "@optee/utils";
import trpcClient from "../../trpc-client";

@Injectable({ providedIn: "root" })
export class YousignService {
  async waitUntilSignatureDone(
    yousignRequestId: YouSignRequestId,
    maxAttempts = 10,
    initialDelay = 1000,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status =
        await trpcClient.yousign.getSignatureRequestStatus.query(
          yousignRequestId,
        );
      const signatureDone = isSignatureDone(status);
      if (signatureDone === null) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), 30_000); // Cap at 30 seconds
        await sleep(delay);
      } else {
        return signatureDone;
      }
    }
    return false;
  }
}
