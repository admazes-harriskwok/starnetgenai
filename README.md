# Starnet Clone - Creative Canvas AI Platform

This is a high-fidelity AI-powered creative canvas application built with Next.js, React Flow, and Google Gemini.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation

First, install dependencies for both the client and the server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the `client` directory:

```env
# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Running the Application

You need to run both the backend server and the frontend client:

**Terminal 1 (Server):**
```bash
cd server
node server.js
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🎨 Key Features
- **Creative Canvas:** Drag-and-drop workflow builder using React Flow.
- **AI Generators:** Specialized nodes for Image Generation, Video Generation (Veo), and Director AI Scene Breakdown.
- **Smart Persistence:** Projects are automatically saved to IndexedDB and appear in your "Recent Projects".
- **HD Restoration:** Split storyboard grids into 9 parallel high-resolution cinematic frames.
- **Editable Logic:** Every node prompt is editable before and after generation for maximum control.

## 🔑 AI Configuration
When you open the app, go to **Settings** to enter your Google Gemini API Key. This key is stored locally in your browser for security and is used to power all AI features.
