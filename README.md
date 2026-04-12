# 🛡️ StudyForge AI — Your Personal Academic OS 

Hey there! Welcome to **StudyForge AI**. 👋

If you're anything like me, you've probably spent countless hours "planning to study" instead of actually studying. You create a perfect, color-coded timetable, only for it to fall apart the second a surprise assignment pops up or you hit the snooze button one too many times. 

I built StudyForge to fix this exact problem. It's not just a stiff, static calendar—it's an AI-powered study companion that helps you stop over-planning and start doing.

**🌍 Try it out:** [study-forge-lake.vercel.app](https://study-forge-lake.vercel.app)

---

## ✨ Why I built this...

I wanted an app that could cure **"Planning Fatigue."**

- **The Problem:** Traditional schedules are too rigid. They break down as soon as your day doesn't go exactly as planned.
- **The Fix:** An intelligent workspace that adapts. StudyForge recalculates and adjusts based on the progress you *actually* make. 

---

## 🚀 Cool Stuff Inside

### 📅 AI Setup in Seconds
Just toss in your subjects and commitments, and our integration with **Gemini 2.5 Flash** will craft a smart, clash-free schedule for you instantly. (Of course, if you're a neat freak like me, there's a drag-and-drop editor to tweak things manually too!)

### 💼 Your Daily Dashboard 
Everything you need for the day in one screen. Tap a study block to jot down quick notes, knock out sub-tasks, or just be honest and flag it as **Done**, **Partial**, or even **Failed**. The dashboard updates live as you go.

### 📊 Nerd-Out on Analytics
I love tracking stats. StudyForge features a GitHub-style heatmap so you can see your daily consistency, track your "Study Volume," and figure out which subjects are eating up your time.

### 📝 Auto-Magic Task Board
It's a Kanban board, but better. Snap a photo of a messy whiteboard or a huge syllabus, and Gemini Vision will extract the work and turn it into clickable, actionable tasks for you.

### ⏳ Built-in Pomodoro
Lock in with customizable focus timers. I even threw in some built-in Lo-Fi, rain sounds, and white noise so you don't have to endlessly tab through Spotify. Plus, everything you log here syncs right to your stats.

---

## 🛠️ How It's Built

A quick peek under the hood for fellow devs! It uses my favorite tools:

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/)
- **Design & UI:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) (because it's just so clean)
- **Backend & DB:** [Supabase](https://supabase.com/)
- **The Brains:** [Google Gemini API](https://ai.google.dev/) (Flash & Vision)
- **State Stuff:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Smoothness:** [Framer Motion](https://www.framer.com/motion/)

---

## 🏁 Try it Locally

Want to spin it up yourself? It's pretty straightforward:

### 1. Clone & Install
```bash
git clone https://github.com/your-username/studyforge-ai.git
cd studyforge-ai
npm install
```

### 2. Set Up Your Env
Make a `.env.local` file (check out `.env.example` if it helps) and drop in these keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start the Server
```bash
npm run dev
```
Open up `http://localhost:3000` and you're good to go!

---

## 🛤️ What's Next?
I've got a lot of cool ideas for where to take this next:
- [ ] **AI Tutor Chat:** Get answers from your course materials right from your task board.
- [ ] **Study Tribes:** Hang out with friends, sync up timetables, and hold each other accountable.
- [ ] **Mobile PWA:** Better offline support so you don’t drain your data on campus.

---

*Made with caffeine and a little too much passion. Let's start achieving.* 🚀
