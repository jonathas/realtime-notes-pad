# 📝 Real-Time Notes Pad

A **self-hosted** real-time collaborative note-taking app built with **React**, **FastAPI**, and **WebSockets**—inspired by Google Docs, but designed for privacy-first local networks.

Perfect for families, small teams, and privacy-conscious users who want to keep their notes completely under their control.

## 🔄 Data Flow

```mermaid
sequenceDiagram
    participant U1 as User 1<br/>(Desktop)
    participant U2 as User 2<br/>(Mobile)
    participant WS as WebSocket<br/>Manager
    participant API as FastAPI Server
    participant DB as SQLite<br/>Database

    Note over U1,U2: Real-time Collaboration

    U1->>WS: Edit note content
    WS->>API: Process change
    API->>DB: Save to database
    API->>WS: Broadcast change
    WS-->>U2: Live update
    
    Note over U1,U2: Metadata Updates
    U2->>API: Change note title
    API->>DB: Update metadata
    API-->>U1: Title updated
    
    Note over API,DB: All data stays local
```

### Real-Time vs REST API

- **📡 WebSocket**: Real-time content changes, cursors, typing indicators
- **🔄 REST API**: Initial load, metadata (title, tags), note management
- **💾 Database**: Single source of truth for all data

## 🏠 Self-Hosted Architecture

- 🍓 **Raspberry Pi friendly**: Runs efficiently on ARM devices
- 🔒 **Privacy-first**: Your notes never leave your network
- 🌐 **Multi-platform**: Web, desktop, and mobile apps
- 📱 **Local network**: Fast, low-latency collaboration
- 💾 **SQLite database**: Simple, reliable, zero-config storage

---

## 🚀 Features

- [x] Real-time collaborative editing via WebSocket
- [ ] Multi-user support with live cursors
- [ ] Firebase Authentication (works with self-hosted setup)
- [ ] Auto-saving with intelligent debouncing
- [x] Multiple notes management
- [ ] Cross-platform clients (Web, Desktop, Mobile)
- [ ] Simple backup (single SQLite file)
- [x] Docker deployment
- [ ] Electron desktop app
- [ ] React Native mobile app

---

## 📦 Tech Stack

### Backend (Self-Hosted Server)

- **FastAPI** (Python) - High-performance API
- **SQLite** - Lightweight, serverless database
- **WebSocket** - Real-time communication
- **Firebase Auth** - User management (optional)

### Frontend (Multi-Platform)

- **React + TypeScript** - Web application
- **Tailwind CSS** - Styling
- **Electron** - Desktop wrapper (planned)
- **React Native** - Mobile apps (planned)

### Deployment

- **Docker** - Containerized deployment
- **Docker Compose** - Single-command setup

---

## 🛠 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/jonathas/realtime-notes-pad.git
cd realtime-notes-pad

# Start with Docker Compose
docker-compose up -d

# Access your notes at http://localhost:8000
```

### Option 2: Manual Setup

```bash
# 1. Start the backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py

# 2. Start the frontend
cd frontend
npm i
npm run dev
```

---

## 📁 Project Structure

```bash
realtime-notes-pad/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/       # Real-time text editor
│   │   │   ├── Toolbar/      # Navigation and controls
│   │   │   └── Modals/       # Settings and note selection
│   │   ├── services/
│   │   │   ├── storage.ts    # API client
│   │   │   ├── firebase.ts   # Authentication
│   │   │   └── websocket.ts  # Real-time communication
│   │   └── hooks/            # React hooks
│   ├── public/
│   └── package.json
├── backend/                  # FastAPI server
│   ├── app/
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── models/           # Database models
│   │   └── auth/             # Authentication
│   ├── data/                 # SQLite database
│   └── requirements.txt
├── docker-compose.yml        # Development setup
└── README.md
```

---

## 🌐 Client Applications

### Web App

- Access via any modern browser
- Works on desktop and mobile
- Real-time collaboration

### 🌐 PWA Features (Connection-Required)

This app is designed as a **connected-only** PWA that requires real-time WebSocket connection:

- 📱 **App-like experience**: Installs like a native app
- 🚀 **Fast loading**: Static assets cached locally
- 🔄 **Smart reconnection**: Automatically reconnects when server available
- 📡 **Connection awareness**: Shows connection status and graceful degradation
- 💾 **No offline storage**: Notes require server connection (by design)

#### Why No Offline Mode?

- Real-time collaboration requires active connections
- Notes are stored securely on your self-hosted server
- Prevents sync conflicts and data loss
- Simpler architecture and better security

#### Connection-First Design

```typescript
// App only works when connected to your server
const wsUrl = `ws://${serverUrl}/ws/${noteId}`;
const ws = new WebSocket(wsUrl);

ws.onopen = () => enableEditor();
ws.onclose = () => showReconnectingMessage();
```

### Desktop App (Planned)

- Electron wrapper for native experience
- Keyboard shortcuts

### Mobile Apps (Planned)

- React Native for iOS/Android

---

## 🔧 Configuration

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL=sqlite:///data/notes.db
CORS_ORIGINS=*
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key

# Frontend (.env)
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
```

### Server Discovery

The app automatically discovers local servers on your network:

```javascript
// Connects to your server automatically
const serverUrl = await discoverLocalServer();
// Example: http://192.168.1.100:8000
```

---

## 🔒 Privacy & Security

### Data Privacy

- ✅ **Local storage**: Notes never leave your network
- ✅ **No cloud dependencies**: Works completely offline
- ✅ **Your data, your control**: Easy backups and migrations
- ✅ **Firebase auth only**: User accounts, not note data

### Security Features

- 🔐 **JWT authentication**: Secure user sessions
- 🛡️ **CORS protection**: Configurable origins
- 🔄 **Automatic backups**: SQLite file copying
- 🚫 **No telemetry**: No tracking or analytics

---

## 🔄 Backup & Restore

### Backup Your Notes

```bash
# Simple file copy
cp data/notes.db backups/notes-$(date +%Y%m%d).db
```

### Restore from Backup

```bash
# Stop the service
docker-compose down

# Restore database
cp backups/notes-20240105.db data/notes.db

# Restart
docker-compose up -d
```

---

## 🤝 Use Cases

### Perfect For

- 👨‍👩‍👧‍👦 **Families**: Shared grocery lists, vacation planning
- 🏢 **Small teams**: Meeting notes, project planning
- 🔒 **Privacy-conscious users**: Keep sensitive notes local
- 🏠 **Home labs**: Self-hosted enthusiasts
- 📚 **Students**: Collaborative study notes
- ✍️ **Writers**: Draft sharing and feedback

### Why Self-Hosted?

- **No subscription fees** - One-time setup
- **Complete privacy** - Your data stays home
- **Fast performance** - Local network speed
- **Works offline** - No internet required
- **Customizable** - Modify to fit your needs

---

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on Raspberry Pi if possible
5. Submit a pull request

---

## 📜 License

MIT © Jonathas Ribeiro

**Built for self-hosters, by self-hosters** 🏠
