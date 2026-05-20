export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Lang = "de" | "en" | "ru" | string;
export type MultiLang = Record<Lang, string>;

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string;
          name: string;
          slug: string;
          theme: string;
          settings: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["artists"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["artists"]["Insert"]>;
      };
      artist_languages: {
        Row: {
          id: string;
          artist_id: string;
          code: string;
          label: string;
          active: boolean;
          position: number;
        };
        Insert: Omit<Database["public"]["Tables"]["artist_languages"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["artist_languages"]["Insert"]>;
      };
      pages: {
        Row: {
          id: string;
          artist_id: string;
          title: MultiLang;
          slug: MultiLang;
          type: string;
          menu_position: number;
          show_in_menu: boolean;
          published: boolean;
          seo_title: MultiLang | null;
          seo_description: MultiLang | null;
          seo_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pages"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["pages"]["Insert"]>;
      };
      blocks: {
        Row: {
          id: string;
          page_id: string;
          type: string;
          position: number;
          content: Json;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["blocks"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["blocks"]["Insert"]>;
      };
      concerts: {
        Row: {
          id: string;
          artist_id: string;
          title: MultiLang;
          date: string;
          time: string | null;
          venue: MultiLang;
          city: MultiLang;
          country: string | null;
          ticket_url: string | null;
          description: MultiLang | null;
          image: string | null;
          gallery: string[];
          featured: boolean;
          published: boolean;
          ical_uid: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["concerts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["concerts"]["Insert"]>;
      };
      repertoire: {
        Row: {
          id: string;
          artist_id: string;
          composer: MultiLang;
          works: Json;
          tab: string;
          position: number;
        };
        Insert: Omit<Database["public"]["Tables"]["repertoire"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["repertoire"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          artist_id: string;
          title: MultiLang;
          slug: string;
          description: MultiLang;
          content: Json;
          cover_image: string | null;
          published: boolean;
          position: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      media: {
        Row: {
          id: string;
          artist_id: string;
          url: string;
          thumbnail_url: string | null;
          filename: string;
          size: number;
          width: number | null;
          height: number | null;
          alt: MultiLang;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["media"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["media"]["Insert"]>;
      };
      contact_submissions: {
        Row: {
          id: string;
          artist_id: string;
          name: string;
          email: string;
          message: string | null;
          subject: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contact_submissions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["contact_submissions"]["Insert"]>;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          artist_id: string;
          email: string;
          name: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["newsletter_subscribers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
      };
      activity_log: {
        Row: {
          id: string;
          artist_id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["activity_log"]["Row"], "id" | "created_at">;
        Update: never;
      };
      content_versions: {
        Row: {
          id: string;
          artist_id: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          data: Json;
          label: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["content_versions"]["Row"], "id" | "created_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["content_versions"]["Row"], "label">>;
      };
    };
  };
}
