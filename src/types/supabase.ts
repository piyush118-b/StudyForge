export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          college: string | null
          branch: string | null
          semester: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          college?: string | null
          branch?: string | null
          semester?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          college?: string | null
          branch?: string | null
          semester?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      timetables: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          tldraw_document: Json | null
          grid_data: Json | null
          onboarding_data: Json | null
          theme: string | null
          is_public: boolean | null
          share_token: string | null
          preview_image_url: string | null
          total_weekly_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          description?: string | null
          tldraw_document?: Json | null
          grid_data?: Json | null
          onboarding_data?: Json | null
          theme?: string | null
          is_public?: boolean | null
          share_token?: string | null
          preview_image_url?: string | null
          total_weekly_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          tldraw_document?: Json | null
          grid_data?: Json | null
          onboarding_data?: Json | null
          theme?: string | null
          is_public?: boolean | null
          share_token?: string | null
          preview_image_url?: string | null
          total_weekly_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          timetable_id: string | null
          date: string
          hours_studied: number | null
          subjects_covered: string[] | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          timetable_id?: string | null
          date?: string
          hours_studied?: number | null
          subjects_covered?: string[] | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          timetable_id?: string | null
          date?: string
          hours_studied?: number | null
          subjects_covered?: string[] | null
          notes?: string | null
          created_at?: string
        }
      }
      stickers: {
        Row: {
          id: string
          user_id: string
          timetable_id: string | null
          emoji: string | null
          label: string | null
          x: number | null
          y: number | null
        }
        Insert: {
          id?: string
          user_id: string
          timetable_id?: string | null
          emoji?: string | null
          label?: string | null
          x?: number | null
          y?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          timetable_id?: string | null
          emoji?: string | null
          label?: string | null
          x?: number | null
          y?: number | null
        }
      }
    }
  }
}
