import { ClientRepository } from "@optee/client-server";
import { UserType } from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import type { MailTemplateId } from "@optee/mailersend-server";
import type { ContactHsId, ContactUuid, UserUuid } from "@optee/models";
import { ProRepository } from "@optee/pro-server";
import { AuthProvider } from "@optee/supabase-server";
import { generateFakeUUID, isEmailFromOptee } from "@optee/utils";

export const UserProvider = {
  async createUserAccount({
    email,
    contactHsId,
    contactUuid,
    sendInvitation = true,
    OTP,
    password,
    emailTemplate,
    partner,
    userType = UserType.CLIENT, // Default to CLIENT if not specified
  }: {
    email: string;
    contactHsId?: ContactHsId;
    contactUuid?: ContactUuid;
    sendInvitation?: boolean;
    OTP?: string;
    password?: string;
    emailTemplate?: MailTemplateId;
    partner?: string | null;
    userType?: UserType;
  }) {
    if (!contactHsId && !contactUuid) {
      throw Error(`Le paramètre contactHsId ou contactUuid est manquant.`);
    }

    if (contactHsId && contactUuid) {
      throw Error(
        `Les paramètres contactHsId et contactUuid sont mutuellement exclusifs.`,
      );
    }

    const { user, session } = await AuthProvider.createUser({
      email,
      password: password ?? generateFakeUUID(),
      email_confirm: true, // admin asserting that the email is legitimate
    });

    if (contactUuid) {
      await ContactRepository.setUserRelation(contactUuid, user.id);
    }

    if (contactHsId) {
      await ContactRepository.setUserRelationFromHubspot(contactHsId, user.id);
    }

    const contact = await ContactRepository.getByUser(user.id);

    if (!contact) {
      throw Error(
        `Aucun contact trouvé pour l'utilisateur avec l'uuid ${user.id}.`,
      );
    }

    if (OTP) {
      await AuthProvider.sendOTP({
        email,
        firstName: contact.firstName ?? "",
        OTP,
        partner,
        userType,
      });
    } else if (sendInvitation && emailTemplate) {
      await AuthProvider.inviteUser({
        email,
        firstName: contact.firstName ?? "",
        emailTemplate,
      });
    }

    return { user, session };
  },

  async getUserTypes(userUuid: UserUuid): Promise<UserType[]> {
    const contact = await ContactRepository.getByUser(userUuid);

    if (!contact) {
      return [];
    }

    const [clientRelated, proRelated] = await Promise.all([
      ClientRepository.getByUser(userUuid),
      ProRepository.getByUser(userUuid),
    ]);

    return [
      isEmailFromOptee(contact.email) ? UserType.ADMIN : null,
      clientRelated ? UserType.CLIENT : null,
      proRelated ? UserType.PRO : null,
    ].filter((type) => type !== null);
  },
};
