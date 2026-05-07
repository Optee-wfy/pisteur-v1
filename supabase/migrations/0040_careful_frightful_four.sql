ALTER TABLE "owners" ADD COLUMN "userid" varchar;--> statement-breakpoint
ALTER TABLE "owners" ADD COLUMN "createdat" timestamp;--> statement-breakpoint
ALTER TABLE "owners" ADD COLUMN "updatedat" timestamp;--> statement-breakpoint
ALTER TABLE "owners" ADD COLUMN "archived" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "owners" ADD COLUMN "teams" varchar[];