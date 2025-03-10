//app/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      job_offers: {
        Row: {
          company: string
          created_at: string | null
          description: string | null
          id: string
          note: string | null
          position: string
          site: string | null
          status: string | null
          status_changes: string[] | null
          url: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          description?: string | null
          id?: string
          note?: string | null
          position: string
          site?: string | null
          status?: string | null
          status_changes?: string[] | null
          url?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string | null
          id?: string
          note?: string | null
          position?: string
          site?: string | null
          status?: string | null
          status_changes?: string[] | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          message: string
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          user_id: string;
          created_at: string | null;
          first_name: string | null;
          last_name: string | null;
          birth_date: string | null;
          email: string;
          avatar: string | null;
          about_me: string | null;
          city: string | null;
          social_links: string | null;
          calendar_note: string | null;
          goal: number | null;
          checklist: string | null;
        };
        Insert: {
          user_id?: string;
          created_at?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          birth_date?: string | null;
          email?: string;
          avatar?: string | null;
          about_me?: string | null;
          city?: string | null;
          social_links?: string | null;
          calendar_note?: string | null;
          goal?: number | null;
          checklist?: string | null;
        };
        Update: {
          user_id?: string;
          created_at?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          birth_date?: string | null;
          email?: string;
          avatar?: string | null;
          about_me?: string | null;
          city?: string | null;
          social_links?: string | null;
          calendar_note?: string | null;
          goal?: number | null;
          checklist?: string | null;
        };
      }
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          start_date: string | null;
          end_date: string | null;
          stripe_subscription_id: string | null;
          job_offers_limit: number;
          cv_creator_limit: number;
          job_offers_used: number;
          cv_creator_used: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: string;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          stripe_subscription_id?: string | null;
          job_offers_limit?: number;
          cv_creator_limit?: number;
          job_offers_used?: number;
          cv_creator_used?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: string;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          stripe_subscription_id?: string | null;
          job_offers_limit?: number;
          cv_creator_limit?: number;
          job_offers_used?: number;
          cv_creator_used?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      requesting_user_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      requesting_user_email: {
        Args: Record<string, never>;
        Returns: string;
      };
      notify_subscribers: {
        Args: {
          p_user_id: string;
          p_notification_type: string;
          p_message: string;
        };
        Returns: void;
      };
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
