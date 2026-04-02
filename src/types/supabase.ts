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
          is_active: boolean
          activated_at: string | null
          semester_start: string | null
          semester_end: string | null
          total_blocks: number
          color_tag: string | null
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
          is_active?: boolean
          activated_at?: string | null
          semester_start?: string | null
          semester_end?: string | null
          total_blocks?: number
          color_tag?: string | null
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
          is_active?: boolean
          activated_at?: string | null
          semester_start?: string | null
          semester_end?: string | null
          total_blocks?: number
          color_tag?: string | null
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
        }
      }
      block_logs: {
        Row: {
          id: string
          user_id: string
          timetable_id: string
          block_id: string
          subject: string
          block_type: string | null
          day_of_week: string
          scheduled_date: string
          scheduled_start: string
          scheduled_end: string
          scheduled_hours: number
          status: string
          actual_hours: number | null
          partial_percentage: number | null
          skip_reason: string | null
          skip_note: string | null
          focus_rating: number | null
          energy_level: string | null
          notes: string | null
          marked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          timetable_id: string
          block_id: string
          subject: string
          block_type?: string | null
          day_of_week: string
          scheduled_date: string
          scheduled_start: string
          scheduled_end: string
          scheduled_hours: number
          status?: string
          actual_hours?: number | null
          partial_percentage?: number | null
          skip_reason?: string | null
          skip_note?: string | null
          focus_rating?: number | null
          energy_level?: string | null
          notes?: string | null
          marked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          timetable_id?: string
          block_id?: string
          subject?: string
          block_type?: string | null
          day_of_week?: string
          scheduled_date?: string
          scheduled_start?: string
          scheduled_end?: string
          scheduled_hours?: number
          status?: string
          actual_hours?: number | null
          partial_percentage?: number | null
          skip_reason?: string | null
          skip_note?: string | null
          focus_rating?: number | null
          energy_level?: string | null
          notes?: string | null
          marked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string
          timetable_id: string
          date: string
          total_blocks: number | null
          completed_blocks: number | null
          partial_blocks: number | null
          skipped_blocks: number | null
          pending_blocks: number | null
          scheduled_hours: number | null
          completed_hours: number | null
          partial_hours: number | null
          completion_rate: number | null
          focus_avg: number | null
          subject_breakdown: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          timetable_id: string
          date: string
          total_blocks?: number | null
          completed_blocks?: number | null
          partial_blocks?: number | null
          skipped_blocks?: number | null
          pending_blocks?: number | null
          scheduled_hours?: number | null
          completed_hours?: number | null
          partial_hours?: number | null
          completion_rate?: number | null
          focus_avg?: number | null
          subject_breakdown?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          timetable_id?: string
          date?: string
          total_blocks?: number | null
          completed_blocks?: number | null
          partial_blocks?: number | null
          skipped_blocks?: number | null
          pending_blocks?: number | null
          scheduled_hours?: number | null
          completed_hours?: number | null
          partial_hours?: number | null
          completion_rate?: number | null
          focus_avg?: number | null
          subject_breakdown?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
