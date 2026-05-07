ALTER TYPE "hs_pipeline_contact_stage_enum" ADD VALUE '3326173431';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geom_groupe" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiment_groupe_id" text,
	"geom_groupe" text
);
