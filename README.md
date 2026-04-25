# StudyForge AI

### *The intelligent study companion.*

**Live Demo:** [study-forge-lake.vercel.app](https://study-forge-lake.vercel.app)

StudyForge AI is an AI-powered academic "OS" designed for flexibility and real student life. It replaces rigid calendars with adaptive schedules that understand your energy, commitments, and deadlines.

---

## 🚀 Key Features

- **AI-Powered Planning:** Generate realistic, clash-free weekly schedules using **Gemini 1.5 Flash** based on your subjects and habits.
- **Dynamic Task Management:** Track assignments, log sub-tasks, and mark blocks as Done, Partial, or Failed.
- **Consistency Analytics:** GitHub-style heatmaps and weekly progress charts to track your academic momentum.
- **OCR Syllabus Scanner:** Convert whiteboard photos, handouts, or notes into actionable tasks instantly with Gemini Vision.
- **Focus Mode (The Forge):** Full-screen Pomodoro mode with built-in Lo-Fi and ambient sounds.

---

## 🛠 Under the Hood

| Component | Tech |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) + TypeScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) |
| **Backend** | [Supabase](https://supabase.com/) (Database & Auth) |
| **AI Integration** | [Google Gemini API](https://ai.google.dev/) (Flash & Vision) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |

---

## ⚙️ Quick Setup

### 1. Installation
```bash
git clone https://github.com/piyush118-b/StudyForge.git
cd StudyForge
npm install
```

### 2. Configuration
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Locally
```bash
npm run dev
```

---

## 🗺 Roadmap

- [ ] **AI Tutor Chat:** Context-aware assistance directly from your task board.
- [ ] **Study Tribes:** Sync plans and compete on consistency with friends.
- [ ] **Mobile App:** PWA with offline support for on-the-go focus.

---

*Built for students who want to stop planning and start achieving.*
