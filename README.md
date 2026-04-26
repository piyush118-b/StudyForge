# StudyForge AI

**The intelligent study companion.**
[Live Demo](https://study-forge-lake.vercel.app)

StudyForge AI is an adaptive academic OS that builds flexible schedules, tracks tasks, and provides deep-work tools using AI.

## ✨ Features
- **AI Planning:** Automated, clash-free schedules via Gemini 1.5 Flash.
- **Task Tracking:** Manage assignments with performance logging (Done/Partial/Failed).
- **OCR Scanner:** Convert syllabus photos to tasks via Gemini Vision.
- **Analytics:** GitHub-style heatmaps and weekly progress metrics.
- **Forge Mode:** Pomodoro sessions with integrated Lo-Fi/ambient audio.

## 🛠 Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion.
- **Backend:** Supabase (Auth, DB, RLS).
- **AI:** Google Gemini (Flash & Vision).
- **State:** Zustand.

## ⚙️ Setup
```bash
git clone https://github.com/piyush118-b/StudyForge.git && cd StudyForge && npm install
```
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_GEMINI_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Run: `npm run dev`
