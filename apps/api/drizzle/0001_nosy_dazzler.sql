ALTER TABLE "activity_reads" RENAME TO "user_activities";--> statement-breakpoint
ALTER TABLE "user_activities" DROP CONSTRAINT "activity_reads_activity_id_activities_id_fk";
--> statement-breakpoint
ALTER TABLE "user_activities" DROP CONSTRAINT "activity_reads_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_activities" DROP CONSTRAINT "activity_reads_activity_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_activity_id_user_id_pk" PRIMARY KEY("activity_id","user_id");--> statement-breakpoint
ALTER TABLE "user_activities" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_activities_user_id_activity_id_idx" ON "user_activities" USING btree ("user_id","activity_id");