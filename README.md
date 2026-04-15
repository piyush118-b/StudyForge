# 🛡️ StudyForge AI

### *The study companion that doesn't judge you.*

**🌍 Live Demo:** [study-forge-lake.vercel.app](https://study-forge-lake.vercel.app)

---

### We've all been there. 🕯️

It’s Sunday night. You’ve spent three hours building the *perfect* color-coded timetable. You’ve got the highlighters out, the Notion template is glowing, and you feel like a scholar. Accomplished, even.

Then Monday arrives. A lecture runs late. You miss a bus. You’re tired. By Tuesday, that perfect schedule is already gathering dust. By Wednesday, you’ve given up entirely.

**StudyForge AI was built to break that cycle.** 

It’s not just another rigid calendar that makes you feel guilty for being human. It’s an AI-powered academic "OS" that understands your energy levels, your commitments, and your very human tendency to procrastinate. We meet you exactly where you are — whether that's a productive morning or a 2 AM "the-exam-is-tomorrow" panic.

> *"It's like having a senior who actually wants you to pass, without the lecture."*

---

## ✨ The Upgrade

| **Typical Student Life** | **The StudyForge Life** |
|---|---|
| 😩 Staring at a pile of books, not knowing where to start. | ✅ Open the app. AI tells you exactly what’s next. |
| 📅 Making a timetable that lasts precisely one day. | 🗓️ A flexible plan that moves with your life. |
| 😰 Realizing the deadline was *today* at 4 PM. | 🔔 Gentle nudges before the panic sets in. |
| 📚 2 hours of "organizing" and 0 hours of studying. | 📈 Focus mode on. Real progress, visible in the charts. |

---

## 🚀 Built for the Grind

### 📅 A Plan That Actually Gets You
Input your subjects, credit hours, and even whether you're a "Morning Owl" or a "Night Bird." **Gemini 1.5 Flash** crunches the numbers to build a realistic, clash-free weekly plan in seconds. 
*No more Sunday night anxiety.*

### 💼 From Chaos to Clarity
Your daily command center. Tap any study block to mark it **Done**, **Partial**, or **Failed**. We don’t judge — we just help you log notes, track sub-tasks, and keep moving forward. 
*Total control over your day.*

### 📊 See Your Momentum
Visual proof of your hard work. A GitHub-style heatmap tracks your consistency across the semester, while weekly charts show you which subjects need a little more love. 
*Progress you can actually feel proud of.*

### 📝 Snap a Syllabus. Get a Plan.
Point your camera at a whiteboard, a printed handout, or a messy handwritten syllabus. Gemini Vision reads the chaos and turns it into structured, actionable tasks instantly. 
*From "What is this?" to "I've got this."*

### ⏳ Deep Work, Minus the Guilt
Step into the "Forge." Full-screen Pomodoro mode with a curated library of Lo-Fi, rain sounds, and white noise. Your focus time is automatically logged, making every minute count. 
*You might actually start liking study sessions.*

---

## 🛠️ Under the Hood (For the Builders)

StudyForge is a premium, full-stack application designed with **Visual Excellence** in mind.

| Component | Tech |
|---|---|
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router) + TypeScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + RLS) |
| **AI Brain** | [Google Gemini API](https://ai.google.dev/) (Flash & Vision) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) (Persisted) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |

---

## 🏁 Join the Forge (Local Setup)

### 1. Clone the Source
```bash
git clone https://github.com/piyush118-b/StudyForge.git
cd StudyForge
npm install
```

### 2. Configure the Brain
Create a `.env.local` file and drop in your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Ignition
```bash
npm run dev
```
Head over to `http://localhost:3000` and start dominating your semester. 🚀

---

## 🛤️ What’s in the Forge?

- [ ] **AI Tutor Chat** — Ask questions directly from your task board. Context-aware, syllabus-powered.
- [ ] **Study Tribes** — Accountability is easier with friends. Sync plans and compete on consistency.
- [ ] **Mobile Power** — Optimized PWA with offline support for studying on the go.

---

## 💡 Why it feels different.

Most "productivity" apps are designed to make you fit into their boxes. StudyForge was built for the messy reality of being a student. For the backlogs, the internal exams, the internship applications, and the 3 AM realizations. 

We’re not here to make you a robot. We’re here to give you **Clarity, Control, and Peace of Mind.**

---

*Made with ☕ far too much caffeine and a genuine belief that students deserve better tools.*
*Built for the students who want to stop planning—and start achieving.* ✨

