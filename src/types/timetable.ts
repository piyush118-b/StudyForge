import { UserData, TimetableGrid } from "@/lib/types";
// We'll expand on this later

export interface TimetableDocument {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tldraw_document: any; // The JSON snapshot
  grid_data: TimetableGrid | null;
  onboarding_data: UserData | null;
  theme: string;
  is_public: boolean;
  share_token: string | null;
  preview_image_url: string | null;
  total_weekly_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  timetable_id: string | null;
  date: string;
  hours_studied: number;
  subjects_covered: string[];
  notes: string | null;
  created_at: string;
}
