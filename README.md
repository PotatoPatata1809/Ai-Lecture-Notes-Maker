<<<<<<< HEAD
<<<<<<< HEAD
# Ai-Lecture-Notes-Maker
Lecture Scribe is a web app that turns audio lectures and YouTube videos into well-structured notes using AI. It automatically transcribes speech, extracts key topics with timestamps, and generates summaries in different detail levels. Users can view, customize, and download notes as a formatted PDF.
=======
# Firebase Studio
=======
# Lecture Scribe: AI-Powered Note Generation
>>>>>>> 7275ba8 (help me push this on git with proper steps readme then make it live on v)

Lecture Scribe is an intelligent web application that automates the process of generating high-quality, structured notes from educational content. It transforms lengthy audio lectures and YouTube videos into well-formatted, easy-to-digest study materials, saving students significant time and effort.

<<<<<<< HEAD
To get started, take a look at src/app/page.tsx.
>>>>>>> eb3bfa1 (Initialized workspace with Firebase Studio)
=======
![Lecture Scribe UI](https://storage.googleapis.com/stelo-assets/lecture-scribe/lecture-scribe-screenshot.png)

---

## ✨ Key Features

*   **Dual Input Sources**:
    *   **Audio File Upload**: Supports MP3, WAV, and M4A audio files.
    *   **YouTube Video URL**: Processes videos directly from YouTube.
*   **Multilingual Support**: Automatically detects the source language, transcribes it, and generates comprehensive notes in English.
*   **Customizable Detail Levels**: Choose between `basic`, `medium`, or `detailed` notes to fit your study needs.
*   **Topic Timestamps**: Automatically extracts key topics with timestamps (MM:SS) to easily reference them in the original lecture.
*   **Rich Formatting & PDF Export**: Generates notes with headings, bolded key terms, and bullet points. You can download the final notes as a beautifully formatted, dark-themed PDF.
*   **Modern UI**: A fully responsive, vibrant, and colorful dark-themed UI that works on all devices.

## 🚀 Technology Stack

*   **Framework**: [Next.js](https://nextjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Generative AI**: [Google's Genkit](https://firebase.google.com/docs/genkit) with the Gemini family of models.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
*   **PDF Generation**: [jspdf](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

---

## 🛠️ Local Development Setup

Follow these steps to run the project on your local machine.

### 1. Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or later)
*   [Git](https://git-scm.com/)

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd lecture-scribe
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

You need a Google AI API key for Genkit to work.

1.  Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate an API key.
2.  Create a file named `.env.local` in the root of your project.
3.  Add your API key to the `.env.local` file:

    ```env
    GEMINI_API_KEY=your_google_api_key_here
    ```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

---

## 🌐 Deploying to Vercel

Follow these steps to deploy your application live on Vercel.

### 1. Push to GitHub

First, create a new repository on [GitHub](https://github.com/new). Then, initialize Git in your project folder and push your code.

```bash
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YourUsername/YourRepoName.git
git push -u origin main
```

### 2. Import Project on Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New... > Project"**.
2.  Import your Git repository from GitHub.

### 3. Configure Project Settings

Vercel will likely detect that you are using Next.js and configure most settings automatically. The one crucial step is to add your environment variable.

*   In the **"Environment Variables"** section, add the `GEMINI_API_KEY` with the same value you used in your `.env.local` file.

![Vercel Environment Variable](https://storage.googleapis.com/stelo-assets/lecture-scribe/vercel-env-var.png)

### 4. Deploy

Click the **"Deploy"** button. Vercel will build and deploy your application. Once finished, you will have a live URL for your Lecture Scribe project!
>>>>>>> 7275ba8 (help me push this on git with proper steps readme then make it live on v)
