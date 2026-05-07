CREATE TABLE IF NOT EXISTS "associations_client_deal" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"client_id" varchar,
	"deal_id_pg" uuid,
	"client_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
ALTER TABLE "associations_batiments_notes" DROP CONSTRAINT "associations_batiments_notes_batiments_id_pg_batiments_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_batiments_notes" DROP CONSTRAINT "associations_batiments_notes_notes_id_pg_notes_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_notes_deal" DROP CONSTRAINT "associations_notes_deal_deal_id_pg_deals_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_notes_deal" DROP CONSTRAINT "associations_notes_deal_notes_id_pg_notes_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_clients_batiments" DROP CONSTRAINT "associations_clients_batiments_batiments_id_pg_batiments_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_clients_batiments" DROP CONSTRAINT "associations_clients_batiments_clients_id_pg_clients_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_contact_clients" DROP CONSTRAINT "associations_contact_clients_contact_id_pg_contacts_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_contact_clients" DROP CONSTRAINT "associations_contact_clients_clients_id_pg_clients_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_contact_batiments" DROP CONSTRAINT "associations_contact_batiments_batiments_id_pg_batiments_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_contact_batiments" DROP CONSTRAINT "associations_contact_batiments_contact_id_pg_contacts_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_contact_deal" DROP CONSTRAINT "associations_contact_deal_deal_id_pg_deals_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_contact_deal" DROP CONSTRAINT "associations_contact_deal_contact_id_pg_contacts_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_deal_batiments" DROP CONSTRAINT "associations_deal_batiments_deal_id_pg_deals_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_deal_batiments" DROP CONSTRAINT "associations_deal_batiments_batiments_id_pg_batiments_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_deal_pros" DROP CONSTRAINT "associations_deal_pros_deal_id_pg_deals_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_deal_pros" DROP CONSTRAINT "associations_deal_pros_pro_id_pg_pros_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_deal_devis" DROP CONSTRAINT "associations_deal_devis_deal_id_pg_deals_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_deal_devis" DROP CONSTRAINT "associations_deal_devis_devis_id_pg_devis_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_devis_notes" DROP CONSTRAINT "associations_devis_notes_devis_id_pg_devis_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_devis_notes" DROP CONSTRAINT "associations_devis_notes_notes_id_pg_notes_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_pros_devis" DROP CONSTRAINT "associations_pros_devis_devis_id_pg_devis_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_pros_devis" DROP CONSTRAINT "associations_pros_devis_pro_id_pg_pros_id_pg_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_client_deal" ADD CONSTRAINT "associations_client_deal_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_client_deal" ADD CONSTRAINT "associations_client_deal_client_id_pg_clients_id_pg_fk" FOREIGN KEY ("client_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_notes" ADD CONSTRAINT "associations_batiments_notes_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_notes" ADD CONSTRAINT "associations_batiments_notes_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_deal" ADD CONSTRAINT "associations_notes_deal_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_deal" ADD CONSTRAINT "associations_notes_deal_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_batiments" ADD CONSTRAINT "associations_clients_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_batiments" ADD CONSTRAINT "associations_clients_batiments_clients_id_pg_clients_id_pg_fk" FOREIGN KEY ("clients_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_clients" ADD CONSTRAINT "associations_contact_clients_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_clients" ADD CONSTRAINT "associations_contact_clients_clients_id_pg_clients_id_pg_fk" FOREIGN KEY ("clients_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_batiments" ADD CONSTRAINT "associations_contact_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_batiments" ADD CONSTRAINT "associations_contact_batiments_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_deal" ADD CONSTRAINT "associations_contact_deal_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_deal" ADD CONSTRAINT "associations_contact_deal_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_batiments" ADD CONSTRAINT "associations_deal_batiments_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_batiments" ADD CONSTRAINT "associations_deal_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_pros" ADD CONSTRAINT "associations_deal_pros_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_pros" ADD CONSTRAINT "associations_deal_pros_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_devis" ADD CONSTRAINT "associations_deal_devis_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_devis" ADD CONSTRAINT "associations_deal_devis_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_notes" ADD CONSTRAINT "associations_devis_notes_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_notes" ADD CONSTRAINT "associations_devis_notes_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_devis" ADD CONSTRAINT "associations_pros_devis_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_devis" ADD CONSTRAINT "associations_pros_devis_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
