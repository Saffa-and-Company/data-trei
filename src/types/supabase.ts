export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          active: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          key: string
          last_used_at: string | null
          name: string | null
          usage_count: number | null
          usage_limit: number | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key: string
          last_used_at?: string | null
          name?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          last_used_at?: string | null
          name?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      aws_connections: {
        Row: {
          access_key_id: string
          created_at: string | null
          expiration: string
          role_arn: string
          secret_access_key: string
          session_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_key_id: string
          created_at?: string | null
          expiration: string
          role_arn: string
          secret_access_key: string
          session_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_key_id?: string
          created_at?: string | null
          expiration?: string
          role_arn?: string
          secret_access_key?: string
          session_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aws_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          event_type: string
          id: string
          message: string
          metadata: Json | null
          repo_name: string
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          message: string
          metadata?: Json | null
          repo_name: string
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          repo_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gcp_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gcp_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gcp_log_ingestion: {
        Row: {
          created_at: string | null
          id: string
          log_sink: string
          project_id: string
          pubsub_topic: string | null
          subscription_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_sink: string
          project_id: string
          pubsub_topic?: string | null
          subscription_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          log_sink?: string
          project_id?: string
          pubsub_topic?: string | null
          subscription_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gcp_log_ingestion_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gcp_logs: {
        Row: {
          fetched_at: string | null
          http_request: Json | null
          id: string
          json_payload: Json | null
          labels: Json | null
          log_name: string | null
          project_id: string
          resource: Json
          severity: string
          text_payload: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          fetched_at?: string | null
          http_request?: Json | null
          id?: string
          json_payload?: Json | null
          labels?: Json | null
          log_name?: string | null
          project_id: string
          resource: Json
          severity: string
          text_payload?: string | null
          timestamp: string
          user_id?: string | null
        }
        Update: {
          fetched_at?: string | null
          http_request?: Json | null
          id?: string
          json_payload?: Json | null
          labels?: Json | null
          log_name?: string | null
          project_id?: string
          resource?: Json
          severity?: string
          text_payload?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gcp_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      github_connections: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "github_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      github_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          event_type: string
          id: number
          message: string
          repo_name: string
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          event_type: string
          id?: number
          message: string
          repo_name: string
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          event_type?: string
          id?: number
          message?: string
          repo_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_event_logs_api_key"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_repos: {
        Row: {
          created_at: string
          id: number
          repo_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          repo_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          repo_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_repos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
