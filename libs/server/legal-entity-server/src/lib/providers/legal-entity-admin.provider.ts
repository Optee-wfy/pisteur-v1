import { LocationBdnbLegalEntityRepository } from "@optee/location-bdnb-legal-entity-server";
import type { LegalEntityUuid } from "@optee/models";
import { LegalEntityRepository } from "../repositories/legal-entity.repository";
import {
  type DeleteLegalEntityForAdminResult,
  LegalEntityAdminRepository,
} from "../repositories/legal-entity-admin.repository";

const REFRESH_STATS_BATCH_SIZE = 20;

export const LegalEntityAdminProvider = {
  getAllForAdmin: LegalEntityAdminRepository.getAllForAdmin,

  async deleteForAdmin(
    legalEntityUuid: LegalEntityUuid,
  ): Promise<DeleteLegalEntityForAdminResult> {
    const legalEntity = await LegalEntityRepository.get(legalEntityUuid);
    if (!legalEntity) {
      throw new Error("Personne morale introuvable.");
    }

    const deletion = await LegalEntityAdminRepository.runInTransaction(
      async (tx) => {
        const associatedLocationUuids =
          await LegalEntityAdminRepository.getAssociatedLocationUuidsForAdmin(
            legalEntityUuid,
            tx,
          );

        const countByLocation =
          await LegalEntityAdminRepository.getAssociationCountsByLocationUuidsForAdmin(
            associatedLocationUuids,
            tx,
          );

        const locationUuidsToDelete = associatedLocationUuids.filter(
          (locationBdnbUuid) =>
            (countByLocation.get(locationBdnbUuid) ?? 0) <= 1,
        );
        const locationUuidsToDeleteSet = new Set(locationUuidsToDelete);
        const locationUuidsToRetain = associatedLocationUuids.filter(
          (locationBdnbUuid) => !locationUuidsToDeleteSet.has(locationBdnbUuid),
        );

        const impactedPros =
          await LegalEntityAdminRepository.getImpactedProsForAdminByLocationUuids(
            associatedLocationUuids,
            locationUuidsToDelete,
            tx,
          );

        const removedProLocationRelationsCount =
          await LegalEntityAdminRepository.countProLocationRelationsByLocationUuidsForAdmin(
            locationUuidsToDelete,
            tx,
          );

        const {
          removedProLegalEntityRelationsCount,
          removedProLegalEntityProsCount,
        } =
          await LegalEntityAdminRepository.deleteProRelationsForLegalEntityForAdmin(
            legalEntityUuid,
            tx,
          );

        const removedLegalEntityLocationRelationsCount =
          await LegalEntityAdminRepository.deleteLocationRelationsForLegalEntityForAdmin(
            legalEntityUuid,
            tx,
          );

        const deletedLocationsCount =
          await LegalEntityAdminRepository.deleteLocationsByUuidsForAdmin(
            locationUuidsToDelete,
            tx,
          );

        const deletedLegalEntity =
          await LegalEntityAdminRepository.deleteLegalEntityByUuidForAdmin(
            legalEntityUuid,
            tx,
          );

        if (!deletedLegalEntity) {
          throw new Error("Impossible de supprimer la personne morale.");
        }

        return {
          legalEntity: deletedLegalEntity,
          impactedPros,
          cleanup: {
            affectedLocationsCount: associatedLocationUuids.length,
            removedLegalEntityLocationRelationsCount,
            deletedLocationsCount,
            retainedLocationsCount: locationUuidsToRetain.length,
            removedProLocationRelationsCount,
            removedProLegalEntityRelationsCount,
            removedProLegalEntityProsCount,
          },
          retainedLocationUuids: locationUuidsToRetain,
        };
      },
    );

    if (deletion.retainedLocationUuids.length > 0) {
      for (
        let index = 0;
        index < deletion.retainedLocationUuids.length;
        index += REFRESH_STATS_BATCH_SIZE
      ) {
        const chunk = deletion.retainedLocationUuids.slice(
          index,
          index + REFRESH_STATS_BATCH_SIZE,
        );

        await Promise.all(
          chunk.map((locationBdnbUuid) =>
            LocationBdnbLegalEntityRepository.refreshLocationLegalEntityStats(
              locationBdnbUuid,
            ),
          ),
        );
      }
    }

    LegalEntityAdminRepository.invalidateAdminTotalCache();

    return {
      status: "deleted",
      legalEntity: deletion.legalEntity,
      cleanup: deletion.cleanup,
      impactedPros: deletion.impactedPros,
    };
  },
};
