import type {
  NewSimulatedLocation,
  SimulatedLocationUuid,
} from "@optee/models";
import { simulatedLocationTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { eq } from "drizzle-orm";

export const SimulatorRepository = {
  async createSimulatedLocation(input: NewSimulatedLocation) {
    const [row] = await db
      .insert(simulatedLocationTable)
      .values(input)
      .returning({ uuid: simulatedLocationTable.uuid });

    return row?.uuid ?? null;
  },

  async getSimulatedLocation(uuid: SimulatedLocationUuid) {
    const [row] = await db
      .select()
      .from(simulatedLocationTable)
      .where(eq(simulatedLocationTable.uuid, uuid));

    return row ?? null;
  },
};
