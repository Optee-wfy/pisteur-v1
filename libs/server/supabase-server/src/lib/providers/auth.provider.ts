import {
  getOnboardingPath,
  HTTP_STATUS_MESSAGES,
  MARKETPLACE_UI_URL,
  unknownError,
  UserType,
} from "@optee/constants";
import {
  MailersendProvider,
  type MailTemplateId,
} from "@optee/mailersend-server";
import type { UserUuid } from "@optee/models";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export type SupabaseAuthResponse =
  | {
      data: {
        user: (User & { id: UserUuid }) | null;
        session: Session | null;
      };
      error: null;
    }
  | {
      data: {
        user: null;
        session: null;
      };
      error: AuthError;
    };

export type SupabaseUserResponse =
  | {
      data: {
        user: (User & { id: UserUuid }) | null;
      };
      error: null;
    }
  | {
      data: {
        user: null;
      };
      error: AuthError;
    };

export const AuthProvider = {
  async createUser({
    email,
    password,
    // The doc says: "If you are sure that the created user's email or phone number is legitimate and verified, you can set the email_confirm or phone_confirm param to true."
    // So it's gotta be false by default
    email_confirm = false,
  }: {
    email: string;
    password: string;
    email_confirm?: boolean;
  }) {
    const {
      data: { user, session },
      error: signUpError,
    } = (await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm,
    })) as SupabaseAuthResponse;

    // 422 is the status code for Unprocessable Entity (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422) it's returned by Supabase when the user already exists (https://supabase.com/docs/reference/javascript/auth-signup#create-a-new-user)
    if (signUpError?.status === 422) {
      throw Error(`Un compte existe déjà avec l'email ${email}.`);
    }

    if (!user) {
      throw Error(
        `Erreur lors de la création de l'utilisateur, le contact est-il bien associé à un Compte ? ${signUpError?.message}`,
      );
    }
    return { user, session };
  },

  async deleteUser({ userUuid }: { userUuid: UserUuid }) {
    const {
      data: { user },
      error,
    } = (await supabase.auth.admin.deleteUser(
      userUuid,
    )) as SupabaseUserResponse;

    if (error) {
      throw new Error(
        `Erreur lors de la suppression de l'utilisateur ${userUuid}: ${error.message}`,
      );
    }

    return { user };
  },

  async inviteUser({
    email,
    firstName,
    emailTemplate,
  }: {
    email: string;
    firstName?: string;
    emailTemplate: MailTemplateId;
  }) {
    const token = await AuthProvider.generateRecoveryLinkToken(email);

    const name = firstName || "Utilisateur";

    await MailersendProvider.sendEmail({
      to: [{ email, name }],
      subject: "Bienvenue chez Optee – Activez votre compte dès maintenant",
      template: emailTemplate,
      data: {
        userName: name,
        redirectLink: `${MARKETPLACE_UI_URL}/auth/reset-password/${token}`,
      },
    });
  },

  async sendOTP({
    email,
    firstName,
    OTP,
    partner,
    userType = UserType.CLIENT,
  }: {
    email: string;
    firstName: string;
    OTP: string;
    partner?: string | null;
    userType?: UserType;
  }) {
    const onboardingUrl =
      userType === UserType.CLIENT
        ? getOnboardingPath({
            step: "client",
            variant: "2025",
            useAbsoluteUrl: true,
            queryParams: { otp: OTP, partenaire: partner ?? undefined },
          })
        : MARKETPLACE_UI_URL + "/onboarding-pro/pro?otp=" + OTP;

    await MailersendProvider.sendEmail({
      to: [{ email, name: firstName }],
      subject: "Bienvenue chez Optee – Activez votre compte dès maintenant",
      template: "ONBOARD_CONTACT",
      data: {
        userName: firstName,
        redirectLink: onboardingUrl,
        OTP,
      },
    });
  },

  async sendResetPasswordMail({
    email,
    firstName,
  }: {
    email: string;
    firstName: string | null;
  }) {
    const token = await AuthProvider.generateRecoveryLinkToken(email);

    await MailersendProvider.sendEmail({
      to: [{ email, name: firstName || "Utilisateur Optee" }],
      subject: "Réinitialisation de votre mot de passe Optee",
      template: "RESET_PASSWORD",
      data: {
        userName: firstName || "",
        redirectLink: `${MARKETPLACE_UI_URL}/auth/reset-password/${token}`,
      },
    });
  },

  async generateRecoveryLinkToken(email: string) {
    const { data, error } = await supabase.auth.admin.generateLink({
      email,
      type: "recovery",
    });

    const token = data.properties?.hashed_token;
    if (!token || error) {
      throw new Error(
        "Impossible de générer le token de réinitialisation du mot de passe: " +
          (error?.status ? HTTP_STATUS_MESSAGES[error?.status] : unknownError),
      );
    }
    return token;
  },
};
