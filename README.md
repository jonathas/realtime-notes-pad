# 📝 Real-Time Notes Pad (Google Docs Lite)

A minimalist real-time collaborative note-taking app built with **React**, **FastAPI**, and (soon) **WebSockets**—inspired by Google Docs, but designed for fast, hackable development.

This project is intended to be cross-platform:

- 🌐 Web: runs in the browser
- 🖥️ Desktop: easily wrapped in Electron
- ☁️ Cloud-ready: deployable via Docker, Kubernetes, and Terraform

---

## 🚀 Features

- [x] Fullscreen text editor with blinking cursor
- [x] Local storage for persistence
- [x] Auto-saving with debounce
- [x] Support for multiple notes
- [x] Server selector for remote note sync
- [ ] Real-time collaboration via WebSocket
- [x] Backend API for CRUD operations
- [ ] Electron desktop support
- [ ] Optional offline mode

---

## 📦 Tech Stack

### Frontend

- Vite + React + TypeScript
- Tailwind CSS
- localStorage for initial persistence
- socket.io-client for live sync

### Backend

- FastAPI (Python)
- PostgreSQL
- REST API + WebSocket (/ws/notes/{id})

### Deployment (planned)

- S3 + CloudFront for frontend hosting
- EKS (via Terraform) for backend
- Docker & Kubernetes support
- Optional Electron packaging

---

## 🛠 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/realtime-notes-pad.git
cd realtime-notes-pad
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Your editor will be running at <http://localhost:5173>

### 3. Start the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
fastapi dev main.py
```

---

## 📁 Project Structure

```bash
frontend/
├── components/
│   ├── Editor/
│   └── Toolbar/
├── services/
│   └── storage.ts        # localStorage now, API later
├── hooks/
├── App.tsx
└── main.tsx

backend/                  # FastAPI (planned)
electron/                 # Optional desktop wrapper
terraform/                # AWS infrastructure config (planned)
```

---

## 💡 Roadmap

- [ ] WebSocket-based live editing
- [ ] Presence: show who’s online
- [ ] Sync cursors across clients
- [ ] Markdown preview
- [ ] Multi-document support
- [ ] Offline-first Electron mode

---

## 🤝 Contributing

Pull requests are welcome. If you’re trying this as a portfolio project or learning platform, feel free to fork it and experiment.

---

## 📜 License

MIT © Jonathas Ribeiro
