CREATE TABLE IF NOT EXISTS "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_clients_batiments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiments_id" varchar,
	"clients_id" varchar,
	"batiments_id_pg" uuid,
	"clients_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_contact_clients" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" varchar,
	"clients_id" varchar,
	"contact_id_pg" uuid,
	"clients_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_contact_deal" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"contact_id" varchar,
	"deal_id_pg" uuid,
	"contact_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_contact_batiments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiments_id" varchar,
	"contact_id" varchar,
	"batiments_id_pg" uuid,
	"contact_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_batiments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"batiments_id" varchar,
	"deal_id_pg" uuid,
	"batiments_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_pros" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"pro_id" varchar,
	"deal_id_pg" uuid,
	"pro_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_devis" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"devis_id" varchar,
	"deal_id_pg" uuid,
	"devis_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_devis_notes" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_id" varchar,
	"notes_id" varchar,
	"devis_id_pg" uuid,
	"notes_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attachments" (
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
	"height" integer,
	"width" integer,
	CONSTRAINT "attachments_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"type" varchar,
	"site_web" text,
	CONSTRAINT "clients_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"email" text,
	"firstname" text,
	"lastname" text,
	"jobtitle" text,
	"phone" text,
	"photo" text,
	"company" text,
	"user_id" uuid,
	CONSTRAINT "contacts_id_unique" UNIQUE("id"),
	CONSTRAINT "contacts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deals" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"createdate" date,
	"dealname" text,
	"prestations" text,
	"dealstage" text,
	"montant_ht" real,
	"montant_ttc" real,
	"montant_offre" real,
	"financements" real,
	"type" text,
	"date_de_lancement" date,
	"date_de_fin_prevue" date,
	"commentaires_client_plateforme" text,
	"budget_disponible" real,
	"nom_et_prenom_decisionnaire" text,
	"adresse_mail_decisionnaire" text,
	"operations_selectionnees" text,
	"operations_identifiees" text,
	"fiches_cee_applicables" text,
	"contrainte_temporelle_client" text,
	"contraintes_techniques" text,
	"simulation_de_l_impact_energetique" text,
	"estimation_consommation_energie_batiment_renove__par_an_" real,
	"impact_energetique_previsionnel" real,
	"delai_de_retour_sur_investissement" real,
	"objectifs_du_maitre_d_ouvrage" text,
	"justification_des_choix_des_operations" text,
	"criteres_d_eligibilite_aux_aides_cee" text,
	"qualifications_necessaires" text,
	"controles_et_verifications" text,
	"signatory_id" uuid,
	CONSTRAINT "deals_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batiments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"numero_de_la_rue" text,
	"nom_de_la_rue" text,
	"code_postal" text,
	"ville" text,
	"secteur" text,
	"criteres_du_batiment" text,
	"nombre_de_batiments" real,
	"nombre_de_lots" real,
	"m2" real,
	"type_d_energie" text,
	"type_de_chauffage" text,
	"annee_de_construction" date,
	"nom_du_contact_sur_site" text,
	"telephone_du_contact_sur_site" text,
	"generateur_de_chauffage" text,
	"etiquette_dpe" text,
	CONSTRAINT "batiments_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"hs_created_by_user_id" varchar,
	"hs_attachment_ids" varchar,
	"hs_object_source" varchar,
	"hs_createdate" timestamp,
	CONSTRAINT "notes_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pros" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"siren" text,
	"adresse_de_facturation" text,
	"code_postal_de_facturation" text,
	"ville_de_facturation" text,
	"mail_du_contact_principal" text,
	CONSTRAINT "pros_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "devis" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"hs_pipeline_stage" text,
	"montant" real,
	"montant_offre" real,
	"taux_de_tva" real,
	"sign_url" text,
	CONSTRAINT "devis_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_batiments" ADD CONSTRAINT "associations_clients_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_batiments" ADD CONSTRAINT "associations_clients_batiments_clients_id_pg_clients_id_pg_fk" FOREIGN KEY ("clients_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_clients" ADD CONSTRAINT "associations_contact_clients_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_clients" ADD CONSTRAINT "associations_contact_clients_clients_id_pg_clients_id_pg_fk" FOREIGN KEY ("clients_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_deal" ADD CONSTRAINT "associations_contact_deal_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_deal" ADD CONSTRAINT "associations_contact_deal_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_batiments" ADD CONSTRAINT "associations_contact_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_batiments" ADD CONSTRAINT "associations_contact_batiments_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_batiments" ADD CONSTRAINT "associations_deal_batiments_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_batiments" ADD CONSTRAINT "associations_deal_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_pros" ADD CONSTRAINT "associations_deal_pros_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_pros" ADD CONSTRAINT "associations_deal_pros_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_devis" ADD CONSTRAINT "associations_deal_devis_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_devis" ADD CONSTRAINT "associations_deal_devis_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_notes" ADD CONSTRAINT "associations_devis_notes_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_notes" ADD CONSTRAINT "associations_devis_notes_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deals" ADD CONSTRAINT "deals_signatory_id_contacts_id_pg_fk" FOREIGN KEY ("signatory_id") REFERENCES "public"."contacts"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;



alter table "associations_clients_batiments" enable row level security;
alter table "associations_contact_batiments" enable row level security;
alter table "associations_contact_clients" enable row level security;
alter table "associations_contact_deal" enable row level security;
alter table "associations_deal_devis" enable row level security;
alter table "associations_deal_batiments" enable row level security;
alter table "associations_deal_pros" enable row level security;
alter table "associations_devis_notes" enable row level security;
alter table "attachments" enable row level security;
alter table "batiments" enable row level security;
alter table "clients" enable row level security;
alter table "contacts" enable row level security;
alter table "deals" enable row level security;
alter table "devis" enable row level security;
alter table "notes" enable row level security;
alter table "pros" enable row level security;
