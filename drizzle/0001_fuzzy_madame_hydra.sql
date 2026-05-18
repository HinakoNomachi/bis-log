ALTER TABLE "blogs" ADD COLUMN "body" text NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blogs_userId_idx" ON "blogs" USING btree ("user_id");