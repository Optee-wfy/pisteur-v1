import {
  contactSupport,
  operationsEmail,
  OPTEE_ALERT_EMAILS,
} from "@optee/constants";
import {
  Attachment,
  EmailParams,
  MailerSend,
  Recipient,
  Sender,
} from "mailersend";

type Lead = {
  address: string;
  company: string;
  heatedSurface: number | string;
  buildingType: string;
  score: string;
  scoreColor: string;
  url: string;
};

type MailTemplatesData = {
  NEW_QUOTE: {
    quoteName: string;
    redirectLink: string;
  };
  INVITE_CLIENT_CONTACT: {
    userName: string;
    redirectLink: string;
  };
  INVITE_PRO_CONTACT: {
    userName: string;
    redirectLink: string;
  };
  INVITE_ACTIF_INACTIF_PRO_CONTACT: {
    userName: string;
    redirectLink: string;
  };
  ONBOARD_CONTACT: {
    userName: string;
    redirectLink: string;
    OTP: string;
  };
  RESET_PASSWORD: {
    userName: string;
    redirectLink: string;
  };
  CREATE_CLIENT_PROJECT: {
    clientSurname: string;
    proCompanyName: string;
    proSurname: string;
    proName: string;
    proPhone: string;
    proMail: string;
  };
  OPERATION_LAUNCHED_CLIENT_ADMIN: {
    clientAdminName: string;
    operationName: string;
    locationAddress: string;
    launchDate: string | null;
    plannedBudgetRange: string;
    briefUrl: string;
  };
  CREDITS_INSUFFICIENT: {
    service: string;
  };
  PROSPECTION_LOCATIONS: {
    proName: string;
    leads_count: number;
    total_buildings: number;
    total_surface: number | string;
    total_companies: number;
    leads: Lead[];
  };
};

// Liste des templates d'email disponibles (Doit être présent dans le type `MailTemplates` au dessus)
export const MAIL_TEMPLATES_IDS: Record<keyof MailTemplatesData, string> = {
  NEW_QUOTE: "zr6ke4nrveylon12",
  INVITE_CLIENT_CONTACT: "pq3enl6qvm542vwr",
  INVITE_PRO_CONTACT: "jy7zpl9wp3045vx6",
  INVITE_ACTIF_INACTIF_PRO_CONTACT: "ynrw7gyednr42k8e",
  ONBOARD_CONTACT: "3yxj6lj22x5gdo2r",
  RESET_PASSWORD: "3z0vklo8wr147qrx",
  CREATE_CLIENT_PROJECT: "3yxj6lj65x54do2r",
  OPERATION_LAUNCHED_CLIENT_ADMIN: "pq3enl6eq2042vwr",
  CREDITS_INSUFFICIENT: "z86org8d31zlew13",
  PROSPECTION_LOCATIONS: "v69oxl59d1rg785k",
} as const;

export type MailTemplateId = keyof typeof MAIL_TEMPLATES_IDS;

const mailerSend = new MailerSend({
  apiKey: process.env["MAILERSEND_API_KEY"] as string,
});

type mailIdentity = { email: string; name: string };

/**
 * Options available for sending an email.
 */
type mailOptions<T extends MailTemplateId> = {
  to: mailIdentity[];
  subject: string;
  template: T;
  from?: mailIdentity;
  cc?: mailIdentity[];
  data?: MailTemplatesData[T];
  mailAttachments?: {
    content: string;
    fileName: string;
  }[];
};

const defaultFrom = { email: "operations@optee.io", name: "Optee" };

export const MailersendProvider = {
  async sendEmail<T extends MailTemplateId>({
    to,
    subject,
    cc,
    from,
    data,
    template,
    mailAttachments,
  }: mailOptions<T>) {
    const sender = from ?? defaultFrom;
    const sentFrom = new Sender(sender.email, sender.name);
    const recipients = to.map(
      (recipient) => new Recipient(recipient.email, recipient.name),
    );

    const attachments = mailAttachments?.map(
      (attachment) =>
        new Attachment(attachment.content, attachment.fileName, "attachment"),
    );
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setTemplateId(MAIL_TEMPLATES_IDS[template])
      .setAttachments(attachments ?? []);
    if (data) {
      emailParams.setPersonalization(
        recipients.map((recipient) => ({
          email: recipient.email,
          data: { ...data, supportEmail: operationsEmail },
        })),
      );
    }

    if (cc?.length) {
      emailParams.setCc(
        cc.map((recipient) => new Recipient(recipient.email, recipient.name)),
      );
    }

    try {
      await mailerSend.email.send(emailParams);
    } catch (error) {
      console.error("🚩 Erreur lors de l'envoi de l'email.", error);
      throw new Error(`Échec de l'envoi de l'email. ${contactSupport}`);
    }
  },

  notifyInsufficientCredits(service: string) {
    return MailersendProvider.sendEmail({
      to: OPTEE_ALERT_EMAILS.map((email) => ({
        email,
        name: "Optee",
      })),
      subject: `Alerte : Crédits ${service} épuisés`,
      template: "CREDITS_INSUFFICIENT",
      data: {
        service,
      },
    });
  },
};
