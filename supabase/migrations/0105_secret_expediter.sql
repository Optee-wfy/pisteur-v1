ALTER TABLE "pros" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "stripe_subscription_status" text;--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "stripe_current_plan_price_id" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pro_stripe_customer_id" ON "pros" USING btree ("stripe_customer_id");