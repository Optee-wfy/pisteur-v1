DO $$ BEGIN
 CREATE TYPE "public"."type_d_energie_enum" AS ENUM('Gaz', 'Electrique', 'Fioul', 'Géothermie', 'Biomasse', 'Autres');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_de_chauffage_enum" AS ENUM('Non connu', 'Individuel', 'Collectif chaufferie', 'Collectif urbain', 'Autre');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."secteur_enum" AS ENUM('resi', 'ter', 'indu', 'Résidentiel collectif');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "batiments" ALTER COLUMN "secteur" SET DATA TYPE secteur_enum USING secteur::secteur_enum;--> statement-breakpoint
ALTER TABLE "batiments" ALTER COLUMN "type_d_energie" SET DATA TYPE type_d_energie_enum USING type_d_energie::type_d_energie_enum;--> statement-breakpoint
ALTER TABLE "batiments" ALTER COLUMN "type_de_chauffage" SET DATA TYPE type_de_chauffage_enum USING type_de_chauffage::type_de_chauffage_enum;
