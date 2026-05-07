CREATE INDEX IF NOT EXISTS "legal_entity_name_index" ON "personne_morale" USING gin ("denomination" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_usual_name_index" ON "personne_morale" USING gin ("denomination_usuelle" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_siret_index" ON "personne_morale" USING gin ("siret" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_siren_index" ON "personne_morale" USING gin ("siren" gin_trgm_ops);
