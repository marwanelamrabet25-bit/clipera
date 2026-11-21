// Généré depuis la base Supabase (outil generate_typescript_types). Ne pas modifier à la main :
// régénérer après chaque migration.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type JobRow = {
  attempts: number;
  cancel_requested: boolean;
  clips_produced: number;
  cost_estimate_usd: number | null;
  created_at: string;
  error_code: string | null;
  error_message: string | null;
  finished_at: string | null;
  heartbeat_at: string | null;
  id: string;
  idempotency_key: string;
  kind: Database["public"]["Enums"]["job_kind"];
  locked_at: string | null;
  locked_by: string | null;
  max_attempts: number;
  metrics: Json;
  options: Json;
  priority: number;
  project_id: string;
  requested_clips: number | null;
  run_after: string;
  source_video_id: string;
  started_at: string | null;
  status: Database["public"]["Enums"]["job_status"];
  status_detail: string | null;
  user_id: string;
};

type JobFnReturn = {
  Returns: JobRow;
  SetofOptions: { from: "*"; to: "processing_jobs"; isOneToOne: true; isSetofReturn: false };
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      audit_log: {
        Row: { action: string; actor_id: string | null; at: string; data: Json | null; id: number; target: string | null };
        Insert: { action: string; actor_id?: string | null; at?: string; data?: Json | null; id?: never; target?: string | null };
        Update: { action?: string; actor_id?: string | null; at?: string; data?: Json | null; id?: never; target?: string | null };
        Relationships: [];
      };
      clips: {
        Row: {
          created_at: string;
          end_seconds: number;
          height: number | null;
          id: string;
          job_id: string;
          project_id: string;
          rank: number;
          render_options: Json;
          score_details: Json | null;
          score_total: number | null;
          size_bytes: number | null;
          source_video_id: string;
          start_seconds: number;
          status: Database["public"]["Enums"]["clip_status"];
          storage_key: string | null;
          thumbnail_key: string | null;
          title: string | null;
          transcript_excerpt: string | null;
          updated_at: string;
          user_id: string;
          width: number | null;
        };
        Insert: {
          created_at?: string;
          end_seconds: number;
          height?: number | null;
          id?: string;
          job_id: string;
          project_id: string;
          rank: number;
          render_options?: Json;
          score_details?: Json | null;
          score_total?: number | null;
          size_bytes?: number | null;
          source_video_id: string;
          start_seconds: number;
          status?: Database["public"]["Enums"]["clip_status"];
          storage_key?: string | null;
          thumbnail_key?: string | null;
          title?: string | null;
          transcript_excerpt?: string | null;
          updated_at?: string;
          user_id: string;
          width?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["clips"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "clips_job_id_fkey"; columns: ["job_id"]; isOneToOne: false; referencedRelation: "processing_jobs"; referencedColumns: ["id"] },
          { foreignKeyName: "clips_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },
          { foreignKeyName: "clips_source_video_id_fkey"; columns: ["source_video_id"]; isOneToOne: false; referencedRelation: "source_videos"; referencedColumns: ["id"] },
        ];
      };
      job_events: {
        Row: {
          at: string;
          data: Json | null;
          from_status: Database["public"]["Enums"]["job_status"] | null;
          id: number;
          job_id: string;
          message: string | null;
          to_status: Database["public"]["Enums"]["job_status"] | null;
          user_id: string;
        };
        Insert: {
          at?: string;
          data?: Json | null;
          from_status?: Database["public"]["Enums"]["job_status"] | null;
          id?: never;
          job_id: string;
          message?: string | null;
          to_status?: Database["public"]["Enums"]["job_status"] | null;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["job_events"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "job_events_job_id_fkey"; columns: ["job_id"]; isOneToOne: false; referencedRelation: "processing_jobs"; referencedColumns: ["id"] },
        ];
      };
      plans: {
        Row: {
          annual_price_cents: number;
          stripe_annual_price_id: string | null;
          created_at: string;
          currency: string;
          export_max_height: number;
          features: Json;
          id: string;
          is_public: boolean;
          max_clips_per_video: number;
          max_concurrent_jobs: number;
          max_upload_bytes: number;
          max_video_seconds: number;
          monthly_source_seconds: number;
          monthly_source_videos: number;
          name: string;
          price_cents: number;
          priority: number;
          sort_order: number;
          stripe_price_id: string | null;
          updated_at: string;
          watermark: boolean;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          export_max_height: number;
          features?: Json;
          id: string;
          is_public?: boolean;
          max_clips_per_video: number;
          max_concurrent_jobs?: number;
          max_upload_bytes: number;
          max_video_seconds: number;
          monthly_source_seconds: number;
          monthly_source_videos: number;
          name: string;
          price_cents: number;
          priority?: number;
          sort_order?: number;
          stripe_price_id?: string | null;
          updated_at?: string;
          watermark?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: [];
      };
      processing_jobs: {
        Row: JobRow;
        Insert: Partial<JobRow> & {
          idempotency_key: string;
          kind: Database["public"]["Enums"]["job_kind"];
          project_id: string;
          source_video_id: string;
          user_id: string;
        };
        Update: Partial<JobRow>;
        Relationships: [
          { foreignKeyName: "processing_jobs_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },
          { foreignKeyName: "processing_jobs_source_video_id_fkey"; columns: ["source_video_id"]; isOneToOne: false; referencedRelation: "source_videos"; referencedColumns: ["id"] },
        ];
      };
      profiles: {
        Row: { created_at: string; display_name: string | null; id: string; is_admin: boolean; updated_at: string };
        Insert: { created_at?: string; display_name?: string | null; id: string; is_admin?: boolean; updated_at?: string };
        Update: { created_at?: string; display_name?: string | null; id?: string; is_admin?: boolean; updated_at?: string };
        Relationships: [];
      };
      projects: {
        Row: { created_at: string; deleted_at: string | null; id: string; title: string; updated_at: string; user_id: string };
        Insert: { created_at?: string; deleted_at?: string | null; id?: string; title?: string; updated_at?: string; user_id: string };
        Update: { created_at?: string; deleted_at?: string | null; id?: string; title?: string; updated_at?: string; user_id?: string };
        Relationships: [];
      };
      source_videos: {
        Row: {
          audio_codec: string | null;
          created_at: string;
          declared_size_bytes: number;
          duration_seconds: number | null;
          fps: number | null;
          has_audio: boolean | null;
          height: number | null;
          id: string;
          original_filename: string;
          probe: Json | null;
          project_id: string;
          purge_after: string | null;
          rejection_reason: string | null;
          rights_confirmed_at: string;
          size_bytes: number | null;
          source_url: string | null;
          status: Database["public"]["Enums"]["source_video_status"];
          storage_key: string;
          updated_at: string;
          user_id: string;
          video_codec: string | null;
          width: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["source_videos"]["Row"]> & {
          declared_size_bytes: number;
          original_filename: string;
          project_id: string;
          rights_confirmed_at: string;
          storage_key: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["source_videos"]["Row"]>;
        Relationships: [
          { foreignKeyName: "source_videos_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },
        ];
      };
      stripe_events: {
        Row: { id: string; type: string; received_at: string };
        Insert: { id: string; type: string; received_at?: string };
        Update: { id?: string; type?: string; received_at?: string };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          billing_interval: string | null;
          stripe_price_id: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan_id: string;
          status: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & { plan_id: string; user_id: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [
          { foreignKeyName: "subscriptions_plan_id_fkey"; columns: ["plan_id"]; isOneToOne: false; referencedRelation: "plans"; referencedColumns: ["id"] },
        ];
      };
      usage_records: {
        Row: {
          created_at: string;
          id: number;
          job_id: string | null;
          kind: Database["public"]["Enums"]["usage_kind"];
          note: string | null;
          period_start: string;
          source_seconds: number;
          source_videos: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          job_id?: string | null;
          kind: Database["public"]["Enums"]["usage_kind"];
          note?: string | null;
          period_start: string;
          source_seconds: number;
          source_videos: number;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["usage_records"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "usage_records_job_id_fkey"; columns: ["job_id"]; isOneToOne: false; referencedRelation: "processing_jobs"; referencedColumns: ["id"] },
        ];
      };
      user_settings: {
        Row: { caption_defaults: Json; default_format: string; default_style: string; locale: string; updated_at: string; user_id: string };
        Insert: { caption_defaults?: Json; default_format?: string; default_style?: string; locale?: string; updated_at?: string; user_id: string };
        Update: { caption_defaults?: Json; default_format?: string; default_style?: string; locale?: string; updated_at?: string; user_id?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      abort_upload: { Args: { p_source_video_id: string }; Returns: undefined };
      delete_my_account: { Args: never; Returns: undefined };
      complete_upload: { Args: { p_source_video_id: string } } & JobFnReturn;
      create_upload: {
        Args: { p_filename: string; p_size_bytes: number; p_rights_confirmed: boolean };
        Returns: { source_video_id: string; project_id: string; storage_key: string }[];
      };
      create_url_import: {
        Args: { p_url: string; p_rights_confirmed: boolean };
        Returns: { source_video_id: string; project_id: string }[];
      };
      youtube_video_id: { Args: { p_url: string }; Returns: string };
      stripe_apply_subscription: {
        Args: {
          p_user: string;
          p_price_id: string;
          p_status: string;
          p_period_start: string;
          p_period_end: string;
          p_cancel_at_period_end: boolean;
          p_customer_id: string;
          p_subscription_id: string;
        };
        Returns: string;
      };
      stripe_set_customer: { Args: { p_user: string; p_customer_id: string }; Returns: undefined };
      cancel_job: { Args: { p_job_id: string } } & JobFnReturn;
      claim_next_job: { Args: { p_kinds?: Database["public"]["Enums"]["job_kind"][]; p_worker_id: string } } & JobFnReturn;
      create_clip_job: {
        Args: { p_idempotency_key: string; p_options: Json; p_requested_clips: number; p_source_video_id: string };
      } & JobFnReturn;
      effective_plan: { Args: { p_user: string }; Returns: Record<string, unknown> };
      enqueue_probe_job: { Args: { p_source_video_id: string } } & JobFnReturn;
      heartbeat_job: { Args: { p_job_id: string; p_worker_id: string }; Returns: boolean };
      my_quota: {
        Args: never;
        Returns: {
          period_end: string;
          period_start: string;
          plan_id: string;
          seconds_limit: number;
          seconds_used: number;
          videos_limit: number;
          videos_used: number;
        }[];
      };
      requeue_stale_jobs: { Args: { p_timeout?: string }; Returns: number };
    };
    Enums: {
      clip_status: "ready" | "rendering" | "failed" | "deleted";
      job_kind: "probe" | "clip_generation" | "import_url";
      job_status:
        | "queued"
        | "uploading"
        | "transcribing"
        | "analyzing"
        | "selecting"
        | "rendering"
        | "completed"
        | "failed"
        | "cancelled";
      source_video_status: "pending_upload" | "uploaded" | "validated" | "rejected" | "deleted" | "importing";
      subscription_status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "unpaid";
      usage_kind: "reserve" | "refund" | "adjust";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
