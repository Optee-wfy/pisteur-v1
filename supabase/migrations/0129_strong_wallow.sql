DO $$ BEGIN
 CREATE TYPE "public"."mail_provider_enum" AS ENUM('google', 'microsoft');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mail_connections" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "mail_provider_enum" NOT NULL,
	"email" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"scope" text NOT NULL,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"token_expires_at" timestamp,
	"last_validated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_mail_connections_user_provider" UNIQUE("user_id","provider"),
	CONSTRAINT "uq_mail_connections_provider_email" UNIQUE("provider","email"),
	CONSTRAINT "uq_mail_connections_provider_account_id" UNIQUE("provider","provider_account_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mail_connections" ADD CONSTRAINT "mail_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
