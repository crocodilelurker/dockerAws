#  Collaborative Room-Based Code Editor

A premium, real-time collaborative coding environment featuring a sleek glassmorphic UI, dynamic room creation, and persistent session management.

##  Architecture

The application follows a modern **Client-Server** architecture designed for low-latency synchronization and high reliability.

###  Frontend (The Client)
- **Vite & React**: Provides a blazing-fast development experience and optimized production builds.
- **Monaco Editor**: The industry-standard editor (powering VS Code) integrated via `@monaco-editor/react`.
- **Yjs (CRDTs)**: Utilizes Conflict-free Replicated Data Types to ensure that code changes from different users merge perfectly without conflicts.
- **y-monaco & y-socket.io**: Bridges the Yjs document with the Monaco Editor and handles the communication layer.
- **Tailwind CSS**: Implements a "Glassmorphic" design system with deep dark tones, blurred backdrops, and JetBrains Mono typography.

###  Backend (The Sync Engine)
- **Node.js**: The runtime for the server.
- **y-socket.io/dist/server**: A specialized WebSocket server that persists Yjs updates and broadcasts them to all participants in a specific 4-digit room.
- **Dynamic Rooms**: Rooms are isolated by unique IDs, ensuring that collaboration remains private to the participants of that code.

---

##  Key Features

### 1. Multi-Step Onboarding
A smooth, state-driven UI flow that guides users from entering their identity to entering a workspace:
- **Username Entry**: Persistent identification.
- **Action Selection**: Choose between creating a new session or joining an existing one.
- **4-Digit Room Codes**: Simple, memorable codes for easy sharing.

### 2. Real-Time Collaboration
- **Zero-Conflict Merging**: Multiple users can type at the exact same time without overwriting each other.
- **Awareness (Presence)**: A sidebar listing all currently active users in the room, complete with a "You" badge and pulsating online indicators.
- **Engagement Notifications**: Beautifully styled dark-theme toasts (via `react-hot-toast`) alert you immediately when someone joins or leaves the workspace.

### 3. Glassmorphic Aesthetic
The UI is designed to feel premium and "Alive":
- **Translucent Panels**: High-blur backdrop filters for a frosted glass effect.
- **Dynamic Glow**: Animated emerald and cyan background orbs that shift based on the current UI state.
- **JetBrains Mono**: The entire UI (and editor) uses high-height developer typography for maximum comfort.

### 4. Resilience & Error Handling
- **Server Monitoring**: The frontend proactively pings the backend every 4 seconds. If the server goes down, a dedicated **Maintenance Mode** screen takes over.
- **Error Boundaries**: A "Crash Catcher" wraps the application to prevent white-screen failures, offering a "Clear State & Reload" option if something goes wrong internally.
- **Deployment Cat (404)**: Attempting to visit invalid paths or orphaned rooms triggers a custom page featuring the "Vite Cat" mascot in an indigo void.

---

## Getting Started

### Prerequisites
- Node.js installed on your machine.
- A running backend instance on port 3000 (default).

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

### Configuration
Create a `.env` file in the `frontend` folder:
```env
VITE_BACKEND_URL=http://localhost:3000
```

### Running Locally
1. Start the backend:
   ```bash
   cd backend && npm run dev
   ```
2. Start the frontend:
   ```bash
   cd frontend && npm run dev
   ```

---

##  Build for Production
To generate an optimized bundle for deployment:
```bash
cd frontend && npm run build
```
The resulting files will be in the `dist` directory, ready to be served by any static host or Docker container.