import type { AppEnum } from "@optee/constants";
import { APP_ENUMS } from "@optee/constants";
import { isNotNullish } from "@optee/utils";
import { EnumRepository } from "../repositories/enum.repository";

export const EnumProvider = {
  async getAll() {
    const results = await Promise.all(
      APP_ENUMS.map(async (item) => {
        const { enumsThatOnlyExistsInConstants, enumsThatOnlyExistsInDB } =
          await EnumProvider.getAllUnsyncedByName(
            item.enumName,
            item.constantsArray,
          );

        if (
          enumsThatOnlyExistsInConstants.length ||
          enumsThatOnlyExistsInDB.length
        ) {
          return `${item.enumName}:\n • onlyInConstants: ${
            enumsThatOnlyExistsInConstants.join(", ") || "—"
          }\n • onlyInDB: ${enumsThatOnlyExistsInDB.join(", ") || "—"}`;
        }
        return null;
      }),
    );

    const nonEmpty = results.filter(isNotNullish);
    if (nonEmpty.length === 0) {
      return "Tous les enums sont synchronisés 🚀";
    }
    return `Enums non synchronisés :\n\n${nonEmpty.join("\n\n")}`;
  },

  async getAllUnsyncedByName(enumName: AppEnum, constantsArray: string[]) {
    const dbEnum = await EnumRepository.getAllByName(enumName);

    const dbSet = new Set(dbEnum);
    const constSet = new Set(constantsArray);

    const enumsThatOnlyExistsInDB = [...dbSet].filter((v) => !constSet.has(v));
    const enumsThatOnlyExistsInConstants = [...constSet].filter(
      (v) => !dbSet.has(v),
    );

    return { enumsThatOnlyExistsInDB, enumsThatOnlyExistsInConstants };
  },
};
