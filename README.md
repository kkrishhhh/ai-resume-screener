# 🚀 AI Resume Screener

A comprehensive, full-stack AI-powered resume analysis and career progression platform. Built to eliminate the friction in the job application process, this tool leverages advanced Large Language Models (LLMs) to instantly parse, evaluate, and provide actionable feedback on any resume. 

Transform static PDFs into dynamic career trajectories with zero authentication barriers.

## ✨ Core Features

*   **⚡ Instant Deep Analysis:** Upload any PDF resume and receive immediate insights including extracted skills, inferred experience levels, and high-confidence role predictions.
*   **🗺️ Dynamic AI Career Roadmaps:** Generate highly-specific, step-by-step markdown career roadmaps tailored to bridge the gap between your current resume and your target job role.
*   **🎯 ATS Job Description Matcher:** Paste a target Job Description (JD) and instantly see your precise ATS compatibility score, matched keywords, missing critical skills, and actionable improvement suggestions.
*   **💬 Conversational RAG (Chat with Resume):** Engage in a context-aware chat directly with your resume data. Ask questions like *"What skills should I highlight for a backend role?"* and get contextual advice.
*   **📊 D3.js Data Visualizations:** Beautiful, responsive UI featuring real-time interactive charts (via Reaviz) and smooth micro-animations (Framer Motion & GSAP).
*   **🛡️ Robust PDF Parsing & Edge Cases:** Built-in safeguards that instantly reject corrupted files, non-PDF formats, and hallucinated documents (e.g., uploading a random essay instead of a resume).

## 🛠️ Technology Stack

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
*   **UI Components:** Custom design system built with [Radix UI](https://www.radix-ui.com/) and [Lucide Icons](https://lucide.dev/)
*   **Charting:** [Reaviz](https://reaviz.io/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/) hosted on [Neon](https://neon.tech/)
*   **ORM:** [Prisma v7](https://www.prisma.io/) (utilizing Next-Gen Driver Adapters)
*   **Rate Limiting:** [Upstash Redis](https://upstash.com/)
*   **AI Engine:** [Groq API](https://groq.com/) running **Llama-3.3-70B** for lightning-fast LPUs.

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have Node.js 18+ installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/ai-resume-screener.git
cd ai-resume-screener
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following keys:
```env
# Groq LLM API
GROQ_API_KEY="your_groq_api_key_here"

# Upstash Redis (For IP Rate Limiting)
UPSTASH_REDIS_REST_URL="your_upstash_url_here"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token_here"

# Neon PostgreSQL Database
DATABASE_URL="your_neon_postgres_connection_string"
```

### 4. Database Setup
Ensure your Neon PostgreSQL database is running, then map your Prisma schema:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🌍 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1. Push your code to a public GitHub repository.
2. Import the repository into your Vercel dashboard.
3. In the Vercel deployment settings, add the 4 Environment Variables listed above.
4. Click **Deploy**. Vercel will automatically install dependencies, run the `next build` command, and launch your application globally.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
