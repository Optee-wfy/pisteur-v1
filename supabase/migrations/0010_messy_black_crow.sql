CREATE TABLE IF NOT EXISTS "hs_attachments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"name" text,
	"url" text,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	"archived" boolean DEFAULT false,
	"path" text,
	"parentFolderId" text,
	"defaultHostingUrl" text,
	"type" text,
	"size" integer,
	"extension" text,
	CONSTRAINT "hs_attachments_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DROP TABLE "attachments";