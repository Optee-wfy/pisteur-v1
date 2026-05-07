import { OPERATION_HUBSPOT_PRESTATION_IDS } from "@optee/constants";
import { LocationSimulatorSchema, SimulatedLocationUuid } from "@optee/models";
import { SimulatorProvider } from "@optee/simulator-server";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../trpc";

export const simulatorRouter = router({
  create: adminProcedure
    .input(
      z.object({
        locationToSimulate: LocationSimulatorSchema,
        selectedOperationId: z.enum(OPERATION_HUBSPOT_PRESTATION_IDS).nullish(),
      }),
    )
    .mutation(({ input }) =>
      SimulatorProvider.create(
        input.locationToSimulate,
        input.selectedOperationId ?? undefined,
      ),
    ),

  get: publicProcedure
    .input(z.object({ uuid: SimulatedLocationUuid }))
    .query(({ input }) => SimulatorProvider.get(input.uuid)),
});
