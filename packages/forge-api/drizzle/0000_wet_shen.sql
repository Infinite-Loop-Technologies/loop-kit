CREATE TYPE "public"."billing_state" AS ENUM('inactive', 'trialing', 'active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."forge_role" AS ENUM('owner', 'admin', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."quota_state" AS ENUM('ok', 'nearing_limit', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('queued', 'running', 'completed', 'failed', 'canceled', 'cancel_requested');--> statement-breakpoint
CREATE TABLE "agent_run_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"content_type" text NOT NULL,
	"url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_run_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"entry_index" integer NOT NULL,
	"level" text NOT NULL,
	"message" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"requested_by_workos_user_id" text NOT NULL,
	"kind" text NOT NULL,
	"input" jsonb NOT NULL,
	"idempotency_key" text,
	"status" "run_status" DEFAULT 'queued' NOT NULL,
	"log_count" integer DEFAULT 0 NOT NULL,
	"artifact_count" integer DEFAULT 0 NOT NULL,
	"cancel_requested_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forge_organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workos_organization_id" text NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"role" "forge_role" DEFAULT 'owner' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forge_organizations_workos_organization_id_unique" UNIQUE("workos_organization_id"),
	CONSTRAINT "forge_organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "organization_billing_state" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"polar_customer_id" text,
	"state" "billing_state" DEFAULT 'inactive' NOT NULL,
	"plan_key" text,
	"entitlements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_event_id" text,
	"last_projected_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_quotas" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"runs_used" integer DEFAULT 0 NOT NULL,
	"runs_limit" integer,
	"tokens_used" bigint DEFAULT 0 NOT NULL,
	"tokens_limit" bigint,
	"enforcement_state" "quota_state" DEFAULT 'ok' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_run_artifacts" ADD CONSTRAINT "agent_run_artifacts_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_run_logs" ADD CONSTRAINT "agent_run_logs_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_organization_id_forge_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."forge_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_billing_state" ADD CONSTRAINT "organization_billing_state_organization_id_forge_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."forge_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_quotas" ADD CONSTRAINT "organization_quotas_organization_id_forge_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."forge_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_run_logs_run_entry_idx" ON "agent_run_logs" USING btree ("run_id","entry_index");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_runs_org_idempotency_key_idx" ON "agent_runs" USING btree ("organization_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_billing_state_polar_customer_id_idx" ON "organization_billing_state" USING btree ("polar_customer_id");