export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      admins: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          credential_url: string | null
          expires_on: string | null
          file_path: string | null
          id: string
          image_path: string | null
          is_visible: boolean
          issued_on: string | null
          issuer: string
          sort_order: number
          title_en: string
          title_th: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          expires_on?: string | null
          file_path?: string | null
          id?: string
          image_path?: string | null
          is_visible?: boolean
          issued_on?: string | null
          issuer?: string
          sort_order?: number
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          expires_on?: string | null
          file_path?: string | null
          id?: string
          image_path?: string | null
          is_visible?: boolean
          issued_on?: string | null
          issuer?: string
          sort_order?: number
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content_en: Json | null
          content_th: Json | null
          cover_path: string | null
          created_at: string
          excerpt_en: string
          excerpt_th: string
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          tags: string[]
          title_en: string
          title_th: string
          updated_at: string
        }
        Insert: {
          content_en?: Json | null
          content_th?: Json | null
          cover_path?: string | null
          created_at?: string
          excerpt_en?: string
          excerpt_th?: string
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Update: {
          content_en?: Json | null
          content_th?: Json | null
          cover_path?: string | null
          created_at?: string
          excerpt_en?: string
          excerpt_th?: string
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_path: string | null
          bio_en: Json | null
          bio_th: Json | null
          created_at: string
          email: string | null
          full_name_en: string
          full_name_th: string
          github_username: string | null
          headline_en: string
          headline_th: string
          id: boolean
          links: Json
          location_en: string
          location_th: string
          resume_path_en: string | null
          resume_path_th: string | null
          university_en: string
          university_th: string
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          bio_en?: Json | null
          bio_th?: Json | null
          created_at?: string
          email?: string | null
          full_name_en?: string
          full_name_th?: string
          github_username?: string | null
          headline_en?: string
          headline_th?: string
          id?: boolean
          links?: Json
          location_en?: string
          location_th?: string
          resume_path_en?: string | null
          resume_path_th?: string | null
          university_en?: string
          university_th?: string
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          bio_en?: Json | null
          bio_th?: Json | null
          created_at?: string
          email?: string | null
          full_name_en?: string
          full_name_th?: string
          github_username?: string | null
          headline_en?: string
          headline_th?: string
          id?: boolean
          links?: Json
          location_en?: string
          location_th?: string
          resume_path_en?: string | null
          resume_path_th?: string | null
          university_en?: string
          university_th?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_images: {
        Row: {
          caption_en: string
          caption_th: string
          created_at: string
          id: string
          is_visible: boolean
          path: string
          project_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          caption_en?: string
          caption_th?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          path: string
          project_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          caption_en?: string
          caption_th?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          path?: string
          project_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          body_en: Json | null
          body_th: Json | null
          cover_path: string | null
          created_at: string
          demo_url: string | null
          end_date: string | null
          id: string
          is_featured: boolean
          is_visible: boolean
          my_role_en: string
          my_role_th: string
          repo_url: string | null
          slug: string
          sort_order: number
          stack: string[]
          start_date: string | null
          summary_en: string
          summary_th: string
          title_en: string
          title_th: string
          updated_at: string
        }
        Insert: {
          body_en?: Json | null
          body_th?: Json | null
          cover_path?: string | null
          created_at?: string
          demo_url?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          my_role_en?: string
          my_role_th?: string
          repo_url?: string | null
          slug: string
          sort_order?: number
          stack?: string[]
          start_date?: string | null
          summary_en?: string
          summary_th?: string
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Update: {
          body_en?: Json | null
          body_th?: Json | null
          cover_path?: string | null
          created_at?: string
          demo_url?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          my_role_en?: string
          my_role_th?: string
          repo_url?: string | null
          slug?: string
          sort_order?: number
          stack?: string[]
          start_date?: string | null
          summary_en?: string
          summary_th?: string
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Relationships: []
      }
      section_items: {
        Row: {
          body_en: string
          body_th: string
          created_at: string
          end_date: string | null
          id: string
          image_path: string | null
          is_visible: boolean
          link_url: string | null
          section_id: string
          sort_order: number
          start_date: string | null
          title_en: string
          title_th: string
          updated_at: string
        }
        Insert: {
          body_en?: string
          body_th?: string
          created_at?: string
          end_date?: string | null
          id?: string
          image_path?: string | null
          is_visible?: boolean
          link_url?: string | null
          section_id: string
          sort_order?: number
          start_date?: string | null
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Update: {
          body_en?: string
          body_th?: string
          created_at?: string
          end_date?: string | null
          id?: string
          image_path?: string | null
          is_visible?: boolean
          link_url?: string | null
          section_id?: string
          sort_order?: number
          start_date?: string | null
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          body_en: Json | null
          body_th: Json | null
          created_at: string
          id: string
          is_system: boolean
          is_visible: boolean
          settings: Json
          slug: string
          sort_order: number
          subtitle_en: string
          subtitle_th: string
          title_en: string
          title_th: string
          type: Database["public"]["Enums"]["section_type"]
          updated_at: string
        }
        Insert: {
          body_en?: Json | null
          body_th?: Json | null
          created_at?: string
          id?: string
          is_system?: boolean
          is_visible?: boolean
          settings?: Json
          slug: string
          sort_order?: number
          subtitle_en?: string
          subtitle_th?: string
          title_en?: string
          title_th?: string
          type: Database["public"]["Enums"]["section_type"]
          updated_at?: string
        }
        Update: {
          body_en?: Json | null
          body_th?: Json | null
          created_at?: string
          id?: string
          is_system?: boolean
          is_visible?: boolean
          settings?: Json
          slug?: string
          sort_order?: number
          subtitle_en?: string
          subtitle_th?: string
          title_en?: string
          title_th?: string
          type?: Database["public"]["Enums"]["section_type"]
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string
          icon_path: string | null
          icon_slug: string | null
          id: string
          is_visible: boolean
          name: string
          note_en: string
          note_th: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          icon_path?: string | null
          icon_slug?: string | null
          id?: string
          is_visible?: boolean
          name: string
          note_en?: string
          note_th?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          icon_path?: string | null
          icon_slug?: string | null
          id?: string
          is_visible?: boolean
          name?: string
          note_en?: string
          note_th?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      post_status: "draft" | "published"
      section_type:
        | "hero"
        | "skills"
        | "projects"
        | "certificates"
        | "latest_posts"
        | "contact"
        | "rich_text"
        | "gallery"
        | "cards"
        | "timeline"
      skill_category: "language" | "framework" | "tool" | "ai_data" | "soft"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      post_status: ["draft", "published"],
      section_type: [
        "hero",
        "skills",
        "projects",
        "certificates",
        "latest_posts",
        "contact",
        "rich_text",
        "gallery",
        "cards",
        "timeline",
      ],
      skill_category: ["language", "framework", "tool", "ai_data", "soft"],
    },
  },
} as const
