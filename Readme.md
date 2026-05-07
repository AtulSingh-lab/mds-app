# Multilingual Document Simplifier (MDS Pro)

An AI-powered web application that simplifies complex documents (legal, medical, government) into easy‑to‑understand language and translates them into multiple languages. The assistant also flags risky clauses and provides a chatbot to answer questions about the document.

## Features

- **Document Processing** – Upload PDFs, AI simplifies and translates content.
- **Multiple Languages** – Hindi, Spanish, French, Bengali, Simple English.
- **Risk Flagging** – Highlights risky clauses with explanations.
- **AI Chatbot** – Ask questions about the simplified document.
- **User Authentication** – Email verification, password reset, JWT cookies.
- **Monthly Quota** – Track usage (5 free documents per month).
- **Responsive UI** – Works on desktop, tablet, mobile.

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router DOM
- Lucide React Icons

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT (cookies)
- Nodemailer (email verification)
- Google Gemini AI API
- Cloudinary (file storage)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- Cloudinary account (optional for file storage)
- Gmail account for sending emails (or any SMTP)

### Environment Variables

Create `.env` files:

**Backend (`backend/.env`)**:
```env
PORT=5001
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

**Frontend (`frontend/.env`)**:
```env
VITE_API_URL=http://localhost:5001/api


Installation
Clone the repository

bash
git clone https://github.com/yourusername/mds-pro.git
cd mds-pro
Install backend dependencies

bash
cd backend
npm install
Install frontend dependencies

bash
cd ../frontend
npm install
Run the application (development)

bash
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend
npm run dev
Open http://localhost:5173 in your browser.

Deployment (Production)
Frontend: Build with npm run build and serve static files (Netlify, Vercel, etc.)

Backend: Deploy to Render, Railway, or any Node.js hosting. Set environment variables.