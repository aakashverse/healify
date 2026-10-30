# Heal-U: AI-Powered Rural & Community Healthcare Platform

Heal-U is an intelligent healthcare platform designed for rural and low-literacy communities. It integrates clinical symptom triage grounded in official **ICMR & WHO guidelines**, a **Multimodal Prescription Vision Scanner**, a **Nearby Primary Health Centre (PHC) Directory**, and immediate **Life-Saving First-Aid SOPs**.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────┐
│     Client (React + Vite)       │  • Tailwind CSS v4 styling
│      Port: 5173                 │  • Cura AI Assistant Modal & FAB
└──────────────┬──────────────────┘  • Prescription Scanner & Audio TTS
               │ Proxy / API calls
┌──────────────▼──────────────────┐
│   Node.js / Express Gateway     │  • Request validation & routing
│      Port: 5000                 │  • Multer buffer forwarding
└──────────────┬──────────────────┘  • Clean error serialization
               │ Native Fetch API
┌──────────────▼──────────────────┐
│  FastAPI AI Microservice        │  • LangChain RAG with ChromaDB
│      Port: 8000                 │  • Safety red-flag detection (SOS)
└─────────────────────────────────┘  • Multimodal Gemini Vision
```

---

## 🚀 How to Run the Project

### 1. Start the AI Microservice (FastAPI)
```bash
cd ai-services
# Activate virtual environment
.\myenv\Scripts\activate   # On Windows
# Start Uvicorn server
uvicorn main:app --reload --port 8000
```
- Healthcheck: `http://localhost:8000/health`
- Interactive API Docs: `http://localhost:8000/docs`

### 2. Start the Backend API Gateway (Express)
```bash
cd server
npm start
# or for auto-reload during development:
npm run dev
```
- Running on: `http://localhost:5000`
- Healthcheck: `http://localhost:5000/health`

### 3. Start the Frontend (React + Vite + Tailwind CSS)
```bash
cd client
npm run dev
```
- Open in browser: `http://localhost:5173`

---

## 🩺 Endpoints & Routes Verified

| Service | Method | Route | Description |
|---|---|---|---|
| **Node API** | `POST` | `/api/chat` | Validates & forwards symptom triage query to FastAPI `/user/chat` |
| **Node API** | `GET` | `/api/facilities` | Retrieves nearby PHCs, CHCs, and District Hospitals from `/search/facilities` |
| **Node API** | `POST` | `/api/upload` | Multipart file upload; buffers and forwards image to `/vision/upload` |
| **Node API** | `POST` | `/api/explain` | JSON base64 payload forwarded to `/vision/explain` |
| **FastAPI** | `POST` | `/user/chat` | Evaluates safety red flags (cardiac, snakebite, breathing, bleeding, maternal); executes RAG retrieval |
| **FastAPI** | `GET` | `/search/facilities` | Returns verified health facility data, ASV availability, 24x7 emergency beds |
| **FastAPI** | `POST` | `/vision/upload` | Stores uploaded prescription image and parses dosage schedules via Vision AI |
| **FastAPI** | `POST` | `/vision/explain` | Parses base64 encoded prescription or medicine blister image |

---

## 🤖 Meet "Cura AI" (Your Healthcare Assistant)
- **Name**: **Cura AI** *(derived from Latin "Cura" meaning care, cure, and healing)*
- **Bilingual**: Understands everyday conversational Hindi (e.g. *"2 din se tez bukhar hai"*, *"seene mein dard"*) and English.
- **Safety First**: Automatically identifies red-flag symptoms and switches to **SOS mode** with direct one-tap dialing to **108 Ambulance Dispatch**.
- **Voice Readout**: Integrated text-to-speech engine with Hindi and English vocalization for low-literacy users.
- **Multimodal Scanner**: Upload or snapshot handwritten prescriptions or blister strips to extract structured dosage times (🌅 Morning, ☀️ Afternoon, 🌙 Night).
