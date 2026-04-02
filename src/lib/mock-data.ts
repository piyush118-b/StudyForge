import { UserData } from "./types";

export const COMMON_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const COMMON_TIME_SLOTS = [
  "07:00-08:00", "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
  "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00",
  "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00",
  "22:00-23:00", "23:00-07:00"
];

export const generateEmptyTimetable = () => {
  const grid: any = {};
  COMMON_DAYS.forEach(day => {
    grid[day] = {};
  });
  return {
    title: "Draft Timetable",
    days: COMMON_DAYS,
    timeSlots: COMMON_TIME_SLOTS,
    grid
  };
};

export const generateMockTimetable = (userData: UserData) => {
  return {
    title: "My CSE 3rd Semester Timetable",
    days: COMMON_DAYS,
    timeSlots: COMMON_TIME_SLOTS,
    grid: {
      Monday: {
        "08:00-09:00": { subject: "Maths", type: "Lecture", color: "#3b82f6", notes: "Formula revisions", priority: "High", sticker: "🔥" },
        "09:00-10:00": { subject: "DSA", type: "Lecture", color: "#10b981", notes: "Graph theory", priority: "High", sticker: "🔥" },
        "13:00-14:00": { subject: "Lunch Break", type: "Break", color: "#374151", notes: "Relax", priority: "Low", sticker: "🍽" },
        "23:00-07:00": { subject: "Sleep", type: "Sleep", color: "#1f2937", notes: "Required rest", priority: "Low", sticker: "😴", isFixed: true }
      },
      Tuesday: {
        "13:00-14:00": { subject: "Lunch Break", type: "Break", color: "#374151", notes: "Relax", priority: "Low", sticker: "🍽" },
        "14:00-16:00": { subject: "DSA Lab", type: "Lab", color: "#14b8a6", notes: "Implementation", priority: "High", sticker: "🔬" },
        "23:00-07:00": { subject: "Sleep", type: "Sleep", color: "#1f2937", notes: "Required rest", priority: "Low", sticker: "😴", isFixed: true }
      },
      Wednesday: {
        "09:00-10:00": { subject: "DBMS", type: "Lecture", color: "#f59e0b", notes: "SQL schemas", priority: "Medium", sticker: "📚" },
        "13:00-14:00": { subject: "Lunch Break", type: "Break", color: "#374151", notes: "Relax", priority: "Low", sticker: "🍽" },
        "23:00-07:00": { subject: "Sleep", type: "Sleep", color: "#1f2937", notes: "Required rest", priority: "Low", sticker: "😴", isFixed: true }
      },
      Thursday: {
        "10:00-11:00": { subject: "Maths", type: "Lecture", color: "#3b82f6", notes: "Calculus", priority: "High", sticker: "🔥" },
        "13:00-14:00": { subject: "Lunch Break", type: "Break", color: "#374151", notes: "Relax", priority: "Low", sticker: "🍽" },
        "14:00-16:00": { subject: "Project Work", type: "Project", color: "#8b5cf6", notes: "Group meetup", priority: "Medium", sticker: "🚀" },
        "23:00-07:00": { subject: "Sleep", type: "Sleep", color: "#1f2937", notes: "Required rest", priority: "Low", sticker: "😴", isFixed: true }
      },
      Friday: {
        "08:00-09:00": { subject: "DSA", type: "Lecture", color: "#10b981", notes: "Dynamic programming", priority: "High", sticker: "🎯" },
        "13:00-14:00": { subject: "Lunch Break", type: "Break", color: "#374151", notes: "Relax", priority: "Low", sticker: "🍽" },
        "18:00-19:00": { subject: "Gym", type: "Fixed", color: "#1f2937", notes: "Workout", priority: "Low", sticker: "💪", isFixed: true },
        "23:00-07:00": { subject: "Sleep", type: "Sleep", color: "#1f2937", notes: "Required rest", priority: "Low", sticker: "😴", isFixed: true }
      },
      Saturday: {
        "10:00-12:00": { subject: "DBMS", type: "Revision", color: "#eab308", notes: "Weekly recap", priority: "Medium", sticker: "🔁" },
        "13:00-14:00": { subject: "Lunch Break", type: "Break", color: "#374151", notes: "Relax", priority: "Low", sticker: "🍽" },
        "23:00-07:00": { subject: "Sleep", type: "Sleep", color: "#1f2937", notes: "Required rest", priority: "Low", sticker: "😴", isFixed: true }
      },
      Sunday: {
        "13:00-14:00": { subject: "Lunch Break", type: "Break", color: "#374151", notes: "Relax", priority: "Low", sticker: "🍽" },
        "23:00-07:00": { subject: "Sleep", type: "Sleep", color: "#1f2937", notes: "Required rest", priority: "Low", sticker: "😴", isFixed: true }
      }
    },
    subjectSummary: [
      { subject: "Maths", totalWeeklyHours: 5, scheduledHours: 2, deficit: 3 },
      { subject: "DSA", totalWeeklyHours: 6, scheduledHours: 4, deficit: 2 },
      { subject: "DBMS", totalWeeklyHours: 4, scheduledHours: 3, deficit: 1 }
    ],
    aiNotes: [
      "I scheduled DSA mostly in your peak windows.",
      "Added some group project time on Thursday.",
      "Enjoy your lighter weekends!"
    ]
  };
};
