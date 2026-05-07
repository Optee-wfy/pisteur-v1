import { yousignRequestId } from "@optee/constants";
import { YouSignProvider } from "@optee/yousign-server";
import { privateProcedure, router } from "../trpc";

export const YousignRouter = router({
  getSignatureRequestStatus: privateProcedure
    .input(yousignRequestId)
    .query(({ input: signatureRequestId }) =>
      YouSignProvider.getSignatureRequestStatus(signatureRequestId),
    ),
});
