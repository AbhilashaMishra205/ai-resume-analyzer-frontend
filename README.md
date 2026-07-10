# AI Resume Analyzer

A full-stack AI-powered web application that analyzes resumes against job descriptions and provides ATS match scores with actionable improvement suggestions.

## ✨ Features
- Upload resume as PDF or DOCX
- Paste job description
- Get ATS match score instantly
- See matched skills (green) and missing skills (red)
- AI-powered resume summary rewriting
- AI-powered bullet point enhancement
- Explain missing skills using AI

## 🛠️ Tech Stack
**Frontend:**
- React + Vite
- Axios
- pdfjs-dist (PDF parsing)
- mammoth (DOCX parsing)

**Backend:**
- Node.js + Express
- OpenAI GPT-4o-mini
- Deployed on Render

##  How It Works
1. User uploads resume (PDF/DOCX) — text extracted in browser
2. User pastes job description
3. Frontend sends both to backend via POST /api/analyze
4. Backend runs keyword matching algorithm
5. Returns match score, matched skills, missing skills, and suggestions
6. AI features call OpenAI API for rewriting and explanations

##  Project Structure
ai-resume-analyzer/
├── ai-resume-analyzer-frontend/   # React + Vite frontend
└── ai-resume-backend/             # Node.js + Express backend

##  Author
Abhilasha Mishra
[LinkedIn](https://www.linkedin.com/in/abhilasha-mishra-206b1a214/)
