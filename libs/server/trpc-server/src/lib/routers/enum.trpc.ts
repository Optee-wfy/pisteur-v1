import { EnumProvider } from "@optee/enum-server";
import { adminProcedure, router } from "../trpc";

export const enumRouter = router({
  getAllUnsynced: adminProcedure.query(() => EnumProvider.getAll()),
});
