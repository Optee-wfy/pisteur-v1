import { contactSupport } from "@optee/constants";
import type { AttachmentHsId } from "@optee/models";
import { hsNotesTable } from "@optee/models";
import { db } from "@optee/supabase-server";

export const NoteRepository = {
  async associateToAttachment(attachmentHsId: AttachmentHsId) {
    const [note] = await db
      .insert(hsNotesTable)
      .values({ attachmentIds: attachmentHsId })
      .returning({ uuid: hsNotesTable.uuid });

    if (!note) {
      console.error(
        `🚩 Erreur lors de la création de la note pour le fichier [${attachmentHsId}]`,
      );
      throw new Error(
        `Erreur lors de la création de la note pour le fichier. ${contactSupport}`,
      );
    }

    return note.uuid;
  },
};
