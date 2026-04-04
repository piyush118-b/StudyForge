# 🛡️ StudyForge AI — The Ultimate Academic OS

**StudyForge AI** is a premium, AI-powered study suite designed to help college students dominate their semester. It combines intelligent scheduling, task management, deep analytics, and focus tools into a single, cohesive ecosystem.

---

## 🚀 Key Features & Sections

### 1. AI Timetable Generator (`/create`)
The core engine of StudyForge. It offers two distinct paths for scheduling:
- **Generate with AI**: Leverages **Gemini 2.5 Flash** to analyze a student's subjects, credit hours, energy patterns (morning bird vs. night owl), and commitments. It generates a clash-free, optimized weekly plan in under 60 seconds.
- **Manual Mode**: A professional-grade drag-and-drop editor for users who want total control over every study block, including custom stickers, themes, and precise time management.

### 2. Live Workspace (Dashboard) (`/dashboard`)
The command center for your day. Unlike static calendars, the StudyForge Dashboard is a **Live Workspace**:
- **Real-time Tracking**: Click on any study block to mark it as **Done**, **Partial**, or **Failed**.
- **Contextual Sidebar**: Selecting a block opens a properties panel where students can add notes, sub-tasks, and specific topics for that session.
- **Dynamic Progress**: A real-time progress bar shows how much of the day's "Study Volume" has been conquered.

### 3. Smart Task Board (Kanban) (`/dashboard/tasks`)
A comprehensive productivity engine:
- **Kanban Flow**: Drag tasks between *To Do*, *In Progress*, and *Done*.
- **Priority & Labels**: Organize by subject, urgency (High/Medium/Low), and custom tags.
- **Gemini OCR (Photo → Task)**: Students can snap a photo of a whiteboard or a printed syllabus. Gemini Vision parses the handwriting and automatically populates the task board with structured, actionable items.

### 4. Advanced Analytics (`/dashboard/analytics`)
Data-driven insights to maintain accountability:
- **Contribution Heatmap**: A GitHub-style grid visualizing study consistency over months.
- **Study Volume Charts**: Weekly breakdown of hours spent vs. hours planned.
- **Subject Distribution**: Beautiful circular charts showing which subjects are getting the most (or least) attention.
- **Streak Tracker**: Gamified consistency tracking to keep the momentum high.

### 5. Pomodoro Focus Mode
An immersive, distraction-free environment:
- **Customizable Timers**: Classic 25/5 intervals or custom focus sessions.
- **Ambient Soundscapes**: Built-in library of Lo-Fi, Rain, and White Noise to enhance concentration.
- **Session Stats**: Every focus session is logged into the analytics engine.

### 6. Personalization & Onboarding
- **Step-by-Step Setup**: Collects data on College, Branch, Semester, and Study Goals to tailor the AI's suggestions.
- **Adaptive UI**: Dark-mode first design with premium glassmorphism, smooth micro-animations, and vibrant gradients.

---

## 🛠️ Technical Architecture

### Core Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Row Level Security)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (Text generation & Vision OCR)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Persisted stores for timetables and tasks)

### Data Architecture
- **Real-time Sync**: Uses Supabase Realtime and custom `useEffect` visibility hooks to ensure data consistency across devices.
- **Logging Pipeline**: A robust API route (`/api/block-logs`) tracks the lifecycle of every study block, feeding into the analytics aggregate tables.

---

## 💎 Design Philosophy
StudyForge AI is built on the principle of **"Visual Excellence"**:
- **Premium Aesthetics**: High-contrast dark mode, curated HSL color palettes (Indigo-to-Teal), and smooth CSS transitions.
- **Micro-interactions**: Every button click, hover, and status update is accompanied by subtle animations to make the app feel "alive".
- **Distraction-Free**: The UI is designed to minimize cognitive load, allowing students to focus purely on their work.

---

## 📅 Roadmap (Upcoming)
- **AI Tutor Chat**: Ask Gemini questions about specific tasks directly from the task board.
- **Collaboration**: Share timetables with classmates or join study "Tribes".
- **PWA Enhancement**: Better offline support and native-like notifications on iOS/Android.

---
*Built for students who want to stop planning and start achieving.*
