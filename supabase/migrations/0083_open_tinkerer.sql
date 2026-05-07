CREATE TABLE IF NOT EXISTS "associations_batiments_favoris_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id_pg" uuid,
	"batiments_id_pg" uuid
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_favoris_pro" ADD CONSTRAINT "associations_batiments_favoris_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_favoris_pro" ADD CONSTRAINT "associations_batiments_favoris_pro_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
