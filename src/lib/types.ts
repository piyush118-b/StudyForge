export interface FixedCommitment {
  id: string;
  type: string; // 'Sleep', 'Class', 'Meal', 'Tuition', 'Gym', etc.
  name?: string; 
  days: string[]; // ['Monday', 'Tuesday', ...]
  startTime: string; 
  endTime: string;
  durationMins?: number; // calculated or manual
  isOptional?: boolean; // for meals, etc.
}

export interface Deadline {
  id: string;
  type: string;
  subject: string;
  date: string;
  notes: string;
}

export interface Subject {
  id: string;
  name: string;
  duration: string; // Legacy field
  lectureHours: number;
  selfStudyHours: number;
  priority: 'High' | 'Medium' | 'Low';
  type: string[]; // Lecture | Lab | Tutorial | Project-based | Revision-heavy | Exam-heavy
}

export interface UserData {
  // Step 0 - Basic Profile
  name: string;
  college: string;
  dailyHours: string; // moved to Step 2 but keeping format
  semester: string;
  branch: string;
  
  // Step 1 - Subjects
  subjects: Subject[];
  
  // Step 3 - Commitments
  commitments: FixedCommitment[];
  
  // Step 4 - Energy
  energyLevel: string; // Legacy
  chronotype: string;
  peakWindow: string;
  breaksFreq: string;
  breakLength: string;
  sessionLength: string;

  // Step 5 - Goals & Constraints
  mainGoals: string[];
  deadlines: Deadline[];
  heavyLightDays: Record<string, string>; // e.g. { "Sunday": "Light", "Friday": "End by 6 PM" }
  hardConstraints: string[];

  // Step 6 - Smart Prefs
  learningStyles: string[];
  revisionPref: string;
  pomodoroPref: string;
  culturalPrefs: string[];
  bufferTime: string;
  displayFormat: string;
}

export interface TimetableSlot {
  subject: string;
  type: string;
  color: string;
  notes: string;
}

export interface TimetableGrid {
  [day: string]: {
    [time: string]: TimetableSlot;
  };
}

export interface TimetableData {
  title: string;
  days: string[];
  timeSlots: string[];
  grid: TimetableGrid;
}
