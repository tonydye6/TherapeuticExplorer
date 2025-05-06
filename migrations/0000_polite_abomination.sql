CREATE TABLE "alternative_treatments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"background" text,
	"traditional_usage" text,
	"mechanism_of_action" text,
	"scientific_evidence" jsonb,
	"cancer_specific_evidence" text,
	"safety_profile" text,
	"contraindications" text,
	"interactions" jsonb,
	"practitioner_requirements" text,
	"recommended_by" text,
	"patient_experiences" jsonb,
	"evidence_rating" text,
	"safety_rating" text,
	"date_added" timestamp DEFAULT now() NOT NULL,
	"tags" jsonb,
	"sources" jsonb,
	"is_favorite" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diet_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	"meal_date" timestamp NOT NULL,
	"meal_type" text NOT NULL,
	"foods" jsonb,
	"beverages" jsonb,
	"calories" integer,
	"supplements" jsonb,
	"reactions" jsonb,
	"notes" text,
	"images" jsonb
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"content" text,
	"parsed_content" jsonb,
	"date_added" timestamp DEFAULT now() NOT NULL,
	"source_date" timestamp,
	"tags" jsonb
);
--> statement-breakpoint
CREATE TABLE "hope_snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"author" text,
	"source" text,
	"tags" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	"entry_date" timestamp NOT NULL,
	"content" text NOT NULL,
	"mood" text,
	"pain_level" integer,
	"energy_level" integer,
	"sleep_quality" integer,
	"symptoms" jsonb,
	"tags" jsonb,
	"location_data" jsonb,
	"images" jsonb
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"role" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"sources" jsonb,
	"model_used" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "plan_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurrence_pattern" jsonb,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_date" timestamp,
	"reminder" boolean DEFAULT false NOT NULL,
	"reminder_time" timestamp,
	"priority" text DEFAULT 'medium',
	"notes" text,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text,
	"source_name" text,
	"date_added" timestamp DEFAULT now() NOT NULL,
	"tags" jsonb,
	"evidence_level" text,
	"is_favorite" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_trials" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"trial_id" text NOT NULL,
	"title" text NOT NULL,
	"phase" text,
	"status" text,
	"locations" jsonb,
	"match_score" integer,
	"date_added" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"notes" text,
	"side_effects" jsonb,
	"effectiveness" jsonb,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"first_name" text,
	"last_name" text,
	"bio" text,
	"profile_image_url" text,
	"display_name" text,
	"diagnosis" text,
	"diagnosis_stage" text,
	"diagnosis_date" timestamp,
	"address" text,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vector_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"research_item_id" integer NOT NULL,
	"document_id" integer,
	"embedding" jsonb NOT NULL,
	"content" text NOT NULL,
	"date_added" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diet_logs" ADD CONSTRAINT "diet_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hope_snippets" ADD CONSTRAINT "hope_snippets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_logs" ADD CONSTRAINT "journal_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");