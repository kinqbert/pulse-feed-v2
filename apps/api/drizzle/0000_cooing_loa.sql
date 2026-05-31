CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE "public"."activity_type_enum" AS ENUM('comment', 'mention', 'task_update', 'deployment');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "activity_type_enum" NOT NULL,
	"actor_id" uuid NOT NULL,
	"metadata" jsonb NOT NULL,
	"search_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_reactions" (
	"activity_id" uuid NOT NULL,
	"emoji" text NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "activity_reactions_activity_id_emoji_user_id_pk" PRIMARY KEY("activity_id","emoji","user_id")
);
--> statement-breakpoint
CREATE TABLE "activity_reads" (
	"activity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "activity_reads_activity_id_user_id_pk" PRIMARY KEY("activity_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_comments" ADD CONSTRAINT "activity_comments_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_comments" ADD CONSTRAINT "activity_comments_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_reactions" ADD CONSTRAINT "activity_reactions_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_reactions" ADD CONSTRAINT "activity_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_reads" ADD CONSTRAINT "activity_reads_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_reads" ADD CONSTRAINT "activity_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_created_at_id_idx" ON "activities" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "activities_actor_id_created_at_id_idx" ON "activities" USING btree ("actor_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "activities_type_created_at_id_idx" ON "activities" USING btree ("type","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "activities_search_text_trgm_idx" ON "activities" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "activity_comments_activity_id_idx" ON "activity_comments" USING btree ("activity_id");