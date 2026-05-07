CREATE TABLE IF NOT EXISTS "personne_morale_tertiaire" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siren" text,
	"nb_locaux_du_groupe" real,
	"denomination" text,
	"forme_juridique" text,
	"code_postal" text,
	"part_siren" text,
	"trancheEffectifs" text,
	"categorieEntreprise" text,
	"categorieJuridique" text,
	"activitePrincipale" text,
	"nom" text,
	"telephone" text,
	"adresse_courriel" text,
	"type_organisme" text,
	"delegue" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personne_morale_copropriete" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"denominationUsuelle_syndic" text,
	"syndic_nom" text,
	"siret_syndic" text,
	"syndic_commune" text,
	"syndic_principal" boolean,
	"numeroVoie_syndic" text,
	"indiceRepetition_syndic" text,
	"libelleCommune_syndic" text,
	"codePostal_syndic" text,
	"libelleVoie_syndic" text,
	"typeVoie_syndic" text
);
--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "coproperty_id" uuid;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "tertiaire_id" uuid;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "denominationUsuelle_syndic" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "syndic_nom" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "siret_syndic" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "siren_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "nb_locaux_du_groupe_1" real;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "denomination_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "forme_juridique_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "code_postal_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "part_siren_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "trancheEffectifs_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "categorieEntreprise_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "categorieJuridique_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "activitePrincipale_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "nom_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "telephone_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "adresse_courriel_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "type_organisme_1" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "delegué_1" boolean;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "siren_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "nb_locaux_du_groupe_2" real;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "denomination_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "forme_juridique_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "code_postal_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "part_siren_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "trancheEffectifs_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "categorieEntreprise_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "categorieJuridique_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "activitePrincipale_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "nom_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "telephone_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "adresse_courriel_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "type_organisme_2" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "delegué_2" boolean;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "siren_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "nb_locaux_du_groupe_3" real;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "denomination_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "forme_juridique_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "code_postal_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "part_siren_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "trancheEffectifs_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "categorieEntreprise_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "categorieJuridique_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "activitePrincipale_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "nom_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "telephone_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "adresse_courriel_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "type_organisme_3" text;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "delegué_3" boolean;--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "import_en_echec" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personne_morale" ADD CONSTRAINT "personne_morale_coproperty_id_personne_morale_copropriete_id_pg_fk" FOREIGN KEY ("coproperty_id") REFERENCES "public"."personne_morale_copropriete"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personne_morale" ADD CONSTRAINT "personne_morale_tertiaire_id_personne_morale_tertiaire_id_pg_fk" FOREIGN KEY ("tertiaire_id") REFERENCES "public"."personne_morale_tertiaire"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_location_group_id_index" ON "batiments_bdnb" USING btree ("batiment_groupe_id");--> statement-breakpoint
ALTER TABLE "personne_morale" ADD CONSTRAINT "personne_morale_coproperty_id_unique" UNIQUE("coproperty_id");--> statement-breakpoint
ALTER TABLE "personne_morale" ADD CONSTRAINT "personne_morale_tertiaire_id_unique" UNIQUE("tertiaire_id");