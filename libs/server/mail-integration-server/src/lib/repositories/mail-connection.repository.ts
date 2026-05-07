import type {
  GoogleMailConnection,
  MailConnection,
  MailProvider,
  MicrosoftMailConnection,
  UserUuid,
} from "@optee/models";
import { mailConnectionsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq } from "drizzle-orm";

type SaveMailConnectionValues = Pick<
  MailConnection,
  | "email"
  | "providerAccountId"
  | "emailVerified"
  | "scope"
  | "accessTokenEncrypted"
  | "refreshTokenEncrypted"
  | "tokenExpiresAt"
  | "lastValidatedAt"
>;

export const MailConnectionRepository = {
  async getByUserUuid(userUuid: UserUuid, provider: MailProvider) {
    const [connection] = await db
      .select()
      .from(mailConnectionsTable)
      .where(
        and(
          eq(mailConnectionsTable.userUuid, userUuid),
          eq(mailConnectionsTable.provider, provider),
        ),
      );

    return connection ?? null;
  },

  async getByEmail(provider: MailProvider, email: string) {
    const [connection] = await db
      .select()
      .from(mailConnectionsTable)
      .where(
        and(
          eq(mailConnectionsTable.provider, provider),
          eq(mailConnectionsTable.email, email),
        ),
      );

    return connection ?? null;
  },

  async getByProviderAccountId(
    provider: MailProvider,
    providerAccountId: string,
  ) {
    const [connection] = await db
      .select()
      .from(mailConnectionsTable)
      .where(
        and(
          eq(mailConnectionsTable.provider, provider),
          eq(mailConnectionsTable.providerAccountId, providerAccountId),
        ),
      );

    return connection ?? null;
  },

  async saveForUser(
    userUuid: UserUuid,
    provider: MailProvider,
    values: SaveMailConnectionValues,
  ) {
    const nextValues = {
      ...values,
      updatedAt: new Date(),
    };

    const [created] = await db
      .insert(mailConnectionsTable)
      .values({
        userUuid,
        provider,
        ...nextValues,
      })
      .onConflictDoUpdate({
        target: [mailConnectionsTable.userUuid, mailConnectionsTable.provider],
        set: nextValues,
      })
      .returning();

    return created ?? null;
  },

  async deleteByUserUuid(userUuid: UserUuid, provider: MailProvider) {
    const [deleted] = await db
      .delete(mailConnectionsTable)
      .where(
        and(
          eq(mailConnectionsTable.userUuid, userUuid),
          eq(mailConnectionsTable.provider, provider),
        ),
      )
      .returning();

    return deleted ?? null;
  },

  async getGoogleByUserUuid(userUuid: UserUuid) {
    const connection = await MailConnectionRepository.getByUserUuid(
      userUuid,
      "google",
    );

    return connection as GoogleMailConnection | null;
  },

  async getGoogleByEmail(email: string) {
    const connection = await MailConnectionRepository.getByEmail(
      "google",
      email,
    );

    return connection as GoogleMailConnection | null;
  },

  async getGoogleBySubject(googleSubject: string) {
    const connection = await MailConnectionRepository.getByProviderAccountId(
      "google",
      googleSubject,
    );

    return connection as GoogleMailConnection | null;
  },

  async getMicrosoftByUserUuid(userUuid: UserUuid) {
    const connection = await MailConnectionRepository.getByUserUuid(
      userUuid,
      "microsoft",
    );

    return connection as MicrosoftMailConnection | null;
  },

  async getMicrosoftByEmail(email: string) {
    const connection = await MailConnectionRepository.getByEmail(
      "microsoft",
      email,
    );

    return connection as MicrosoftMailConnection | null;
  },

  async getMicrosoftByUserId(microsoftUserId: string) {
    const connection = await MailConnectionRepository.getByProviderAccountId(
      "microsoft",
      microsoftUserId,
    );

    return connection as MicrosoftMailConnection | null;
  },
};
