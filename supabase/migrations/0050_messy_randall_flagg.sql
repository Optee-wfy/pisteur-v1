DO $$ BEGIN
 CREATE TYPE "public"."pro_status_enum" AS ENUM('Onboarding plateforme', 'En attente de signature plateforme', 'Compte en attente de validation', 'Actif', 'Inactif', 'Out');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "status" "pro_status_enum";