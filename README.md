# 🛡️ StudyForge AI — The Ultimate Academic OS



### **Stop planning. Start achieving.**

**🌍 Live Demo:** [study-forge-lake.vercel.app](https://study-forge-lake.vercel.app)

StudyForge AI is not just another calendar. It's a premium, AI-powered study suite designed for students who are tired of "planning to plan." By combining intelligent scheduling, real-time tracking, and deep data analytics, StudyForge turns your academic goals into a concrete, executable roadmap.

---

## ✨ Why StudyForge?

Most students spend more time organizing their tasks than actually doing them. We built StudyForge to solve **Planning Fatigue**.

- **The Problem**: Static schedules break the moment life happens.
- **The Solution**: An adaptive, intelligent workspace that recalculates based on your progress and energy levels.

---

## 🚀 Game-Changing Features

### 📅 AI Timetable Generator
Input your subjects and commitments, and let **Gemini 2.5 Flash** create an optimized, clash-free schedule in seconds. Prefer total control? Use our professional drag-and-drop editor.

### 💼 Live Workspace (Dashboard)
Your day, at a glance. Select any study block to log notes, track sub-tasks, or mark progress as **Done**, **Partial**, or **Failed**. Your dashboard evolves as you work.

### 📊 Deep Analytics
Stop guessing. Visualize your consistency with a GitHub-style contribution heatmap, track your "Study Volume" over time, and see exactly which subjects are getting your focus.

### 📝 Smart Task Board
A professional Kanban system with a twist: snap a photo of your syllabus or whiteboard, and Gemini Vision will automatically populate your board with actionable tasks.

### ⏳ Pomodoro Focus Mode
Dive into deep work with customizable timers and built-in ambient soundscapes (Lo-Fi, Rain, White Noise). Every session is automatically logged to your analytics.

---

## 🛠️ The Tech Stack

StudyForge is built with a state-of-the-art stack for maximum performance and visual excellence:

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Backend / Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Row Level Security)
- **AI Brain**: [Google Gemini API](https://ai.google.dev/) (Flash & Vision)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/your-username/studyforge-ai.git
cd studyforge-ai
npm install
```

### 2. Configure Environment
Create a `.env.local` file with your credentials (see `.env.example` if available):
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GOOGLE_GEMINI_API_KEY=your_key
```

### 3. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000` and start your journey.

---

## 🛤️ Roadmap
- [ ] **AI Tutor Chat**: Contextual Q&A directly on your task board.
- [ ] **Study Tribes**: Collaborative timetables and accountability groups.
- [ ] **Mobile PWA**: Enhanced offline support and native notifications.

---

*Built for students who want to stop planning and start achieving.*
