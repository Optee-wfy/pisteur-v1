ALTER TABLE "batiments_bdnb" ADD COLUMN "batiment_groupe_id" text;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ADD COLUMN "raw_bdnb" jsonb;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ADD COLUMN "geom_groupe" jsonb;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ADD COLUMN "surface_that_requires_heating" real;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "s_geom_groupe";