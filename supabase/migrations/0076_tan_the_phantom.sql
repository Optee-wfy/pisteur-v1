ALTER TABLE "batiments" ALTER COLUMN "nb_log" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "batiments" ALTER COLUMN "nb_log_rnc" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "batiments" ALTER COLUMN "nb_lot_tertiaire_rnc" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "batiments" ALTER COLUMN "nb_pdl_res_dle_elec_2020" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "batiments" ALTER COLUMN "nb_pdl_pro_dle_elec_2020" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "batiments" ALTER COLUMN "nb_pdl_pro_dle_gaz_2020" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "batiments" ALTER COLUMN "nb_pdl_res_dle_gaz_2020" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "pros" ADD CONSTRAINT "uq_pro_partnership_request_yousign_id" UNIQUE("contrat_partenariat_id");--> statement-breakpoint
ALTER TABLE "pros" ADD CONSTRAINT "uq_pro_cee_request_yousign_id" UNIQUE("contrat_cee_id");--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "uq_devis_sign_request_yousign_id" UNIQUE("requete_signature_yousign_id");