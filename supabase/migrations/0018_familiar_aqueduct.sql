ALTER TABLE "associations_batiments_notes" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_notes_deal" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_clients_batiments" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_contact_clients" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_contact_batiments" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_contact_deal" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_deal_batiments" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_deal_pros" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_deal_devis" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_devis_notes" ALTER COLUMN "association_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_pros_devis" ALTER COLUMN "association_type_id" SET NOT NULL;