# 🛡️ StudyForge AI

**Stop planning. Start achieving. Dominate your semester.**

[Explore the Live Demo](https://study-forge-lake.vercel.app)

StudyForge AI is not just another calendar app—it's an **Adaptive Academic OS**. We built it for the students who are tired of clunky planners and rigid schedules. By combining intelligent Artificial intelligence with premium design, StudyForge transforms your chaotic syllabus into a clear, actionable path to success.

---

## ✨ Why StudyForge?

Traditional tools expect you to adapt to them. StudyForge adapts to *you*.

*   **🧠 Brain-Powered Planning:** Forget clashes. Our AI engine (powered by Gemini 2.5 Flash) analyzes your subjects, energy levels, and commitments to build the perfect weekly schedule in seconds.
*   **📸 Lens to Logic:** Snap a photo of your syllabus or a messy whiteboard. Our OCR scanner automatically extracts tasks, saving you hours of manual data entry.
*   **📊 Insight, Not Just Data:** See your growth with GitHub-style consistency heatmaps and deep-dive analytics. Know exactly where your time goes and celebrate your wins.
*   **🔥 The Forge Mode:** Enter a state of deep work with integrated Pomodoro timers and curated ambient soundscapes. It’s your distraction-free zone for peak performance.
*   **🎨 Visual Excellence:** A premium, dark-mode first interface with glassmorphism and smooth micro-animations. Because your workspace should be as inspiring as your goals.

---

## 🛠️ The Engine Room

StudyForge is built with a modern, high-performance stack designed for speed and reliability:

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router) for a lightning-fast, SEO-friendly experience.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) for that premium, responsive look.
- **Intelligence:** [Google Gemini](https://ai.google.dev/) (Flash & Vision) driving our smart scheduling and OCR.
- **Backend:** [Supabase](https://supabase.com/) handling authentication and real-time data sync.
- **State:** [Zustand](https://zustand-demo.pmnd.rs/) for seamless, persistent local state management.

---

## ⚙️ Getting Started

Ready to build your own Forge? Follow these steps to get the environment running locally:

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/piyush118-b/StudyForge.git
    cd StudyForge
    npm install
    ```

2.  **Set the Foundations:**
    Create a `.env.local` file in the root and add your keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    GOOGLE_GEMINI_API_KEY=your_gemini_key
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

3.  **Ignite the Engine:**
    ```bash
    npm run dev
    ```
    Your local forge will be live at `http://localhost:3000`.

---

## 🤝 Join the Journey

StudyForge is built by students, for students. Whether you want to fix a bug, suggest a feature, or just say hi, we'd love to have you.

*   **Feedback?** Open an issue or reach out.
*   **Contributions?** Pull requests are always welcome!

*Built with ❤️ for those who want to achieve more.*
