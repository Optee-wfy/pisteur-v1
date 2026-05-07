DO $$ BEGIN
 CREATE TYPE "public"."token_enum" AS ENUM('hubspot');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" "token_enum" NOT NULL,
	"access_token" text NOT NULL,
	"expires_at" text NOT NULL,
	CONSTRAINT "tokens_id_unique" UNIQUE("id")
);
