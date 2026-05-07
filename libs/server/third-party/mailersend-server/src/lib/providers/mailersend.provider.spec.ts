import { operationsEmail } from "@optee/constants";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import type { Mock } from "vitest";
import { describe, expect, it, vi } from "vitest";
import { MailersendProvider } from "./mailersend.provider";

// Mocks all imports of the `mailersend` package
vi.mock("mailersend", () => ({
  MailerSend: vi.fn().mockImplementation(() => ({
    email: {
      send: vi.fn(),
    },
  })),
  EmailParams: vi.fn().mockImplementation(() => ({
    setFrom: vi.fn().mockReturnThis(),
    setTo: vi.fn().mockReturnThis(),
    setSubject: vi.fn().mockReturnThis(),
    setTemplateId: vi.fn().mockReturnThis(),
    setPersonalization: vi.fn().mockReturnThis(),
    setCc: vi.fn().mockReturnThis(),
  })),
  Recipient: vi.fn().mockImplementation((email, name) => ({ email, name })),
  Sender: vi.fn().mockImplementation((email, name) => ({ email, name })),
}));

const EmailParamsMock = expect.objectContaining({
  setFrom: expect.any(Function),
  setTo: expect.any(Function),
  setSubject: expect.any(Function),
  setTemplateId: expect.any(Function),
  setPersonalization: expect.any(Function),
  setCc: expect.any(Function),
});

describe("MailersendProvider", () => {
  const defaultFrom = { email: "operations@optee.io", name: "Optee" };

  it("should init MailerSend with the API key", async () => {
    expect(MailerSend).toHaveBeenCalledWith({
      apiKey: process.env["MAILERSEND_API_KEY"],
    });
  });

  it("should send an email successfully", async () => {
    await MailersendProvider.sendEmail({
      to: [{ email: "test@example.com", name: "Test User" }],
      subject: "Test Subject",
      template: "NEW_QUOTE",
      data: { quoteName: "Test Quote", redirectLink: "http://example.com" },
    });

    expect(MailerSend).toHaveBeenCalledWith({
      apiKey: process.env["MAILERSEND_API_KEY"],
    });
    expect(EmailParams).toHaveBeenCalled();
    const emailParamsInstance = (EmailParams as Mock).mock.results[0]?.value;

    expect(emailParamsInstance.setFrom).toHaveBeenCalledWith(
      new Sender(defaultFrom.email, defaultFrom.name),
    );
    expect(emailParamsInstance.setTo).toHaveBeenCalledWith([
      new Recipient("test@example.com", "Test User"),
    ]);
    expect(emailParamsInstance.setSubject).toHaveBeenCalledWith("Test Subject");
    expect(emailParamsInstance.setTemplateId).toHaveBeenCalledWith(
      "zr6ke4nrveylon12",
    );
    expect(emailParamsInstance.setPersonalization).toHaveBeenCalledWith([
      {
        email: "test@example.com",
        data: {
          quoteName: "Test Quote",
          redirectLink: "http://example.com",
          supportEmail: operationsEmail,
        },
      },
    ]);
  });

  it("should throw an error if email sending fails", async () => {
    const mailerSendInstance = (MailerSend as Mock).mock.results[0]?.value;
    mailerSendInstance.email.send.mockRejectedValueOnce(
      new Error("Failed to send email"),
    );

    await expect(
      MailersendProvider.sendEmail({
        to: [{ email: "test@example.com", name: "Test User" }],
        subject: "Test Subject",
        template: "NEW_QUOTE",
        data: { quoteName: "Test Quote", redirectLink: "http://example.com" },
      }),
    ).rejects.toThrow("Échec de l'envoi de l'email.");

    expect(mailerSendInstance.email.send).toHaveBeenCalledWith(EmailParamsMock);
  });

  it("should send an email with CC recipients", async () => {
    await MailersendProvider.sendEmail({
      to: [{ email: "test@example.com", name: "Test User" }],
      subject: "Test Subject",
      template: "NEW_QUOTE",
      cc: [{ email: "cc@example.com", name: "CC User" }],
      data: { quoteName: "Test Quote", redirectLink: "http://example.com" },
    });

    const emailParamsInstance = (EmailParams as Mock).mock.results[2]?.value;
    const mailerSendInstance = (MailerSend as Mock).mock.results[0]?.value;

    expect(emailParamsInstance.setCc).toHaveBeenCalled();
    expect(mailerSendInstance.email.send).toHaveBeenCalledWith(EmailParamsMock);
  });
});
