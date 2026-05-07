DO $$ BEGIN
 CREATE TYPE "public"."hs_pipeline_stage_enum" AS ENUM('674210002', '694626784', '710645179', '674210003', '711701993', '695282417', '1252349143', '712508645', '1142188256', '702310850', '712519380', '1135917303', '698849526');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "devis" ALTER COLUMN "hs_pipeline_stage" SET DATA TYPE hs_pipeline_stage_enum USING hs_pipeline_stage::hs_pipeline_stage_enum;
