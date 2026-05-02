import './App.css'
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "/";

function App() {
  const currentPath = window.location.pathname;
  const editorRef = useRef(null);
  const [uiState, setUiState] = useState(() => localStorage.getItem("uiState") || "username");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [roomId, setRoomId] = useState(() => localStorage.getItem("roomId") || "");
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const [users, setUsers] = useState([]);
  const previousUsers = useRef([]);
  const isFirstUpdate = useRef(true);
  const changeUiState = (newState) => {
    setUiState(newState);
    localStorage.setItem("uiState", newState);
  };

  const handleSetUsername = (e) => {
    if (e) e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("username", username);
      changeUiState("choose");
    }
  };

  const handleCreateRoom = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomId(code);
    localStorage.setItem("roomId", code);
    changeUiState("create");
  };

  const handleJoinStart = () => {
    setRoomCodeInput("");
    changeUiState("join");
  };

  const handleJoinSubmit = (e) => {
    if (e) e.preventDefault();
    if (roomCodeInput.trim().length === 4) {
      setRoomId(roomCodeInput.trim());
      localStorage.setItem("roomId", roomCodeInput.trim());
      changeUiState("editor");
    } else {
      toast.error("Please enter a valid 4-digit code");
    }
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem("roomId");
    localStorage.setItem("uiState", "choose");
    window.location.reload();
  };

  const ydoc = useMemo(() => new Y.Doc(), []);
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    const provider = new SocketIOProvider(BACKEND_URL, roomId, ydoc, {
      autoConnect: true
    });

    const updateUsers = () => {
      const activeUsers = Array.from(provider.awareness.getStates().values())
        .map(state => state.user?.name)
        .filter(Boolean);
      const uniqueActiveUsers = [...new Set(activeUsers)];

      if (isFirstUpdate.current) {
        isFirstUpdate.current = false;
      } else {
        const previous = previousUsers.current;
        const joined = uniqueActiveUsers.filter(u => !previous.includes(u));
        const left = previous.filter(u => !uniqueActiveUsers.includes(u));

        joined.forEach(u => {
          if (u !== username) toast.success(`${u} joined the room`, {
            style: {
              borderRadius: '10px',
              background: '#27272a',
              color: '#fff',
              border: '1px solid #3f3f46'
            },
          });
        });
        left.forEach(u => {
          if (u !== username) toast.error(`${u} left the room`, {
            style: {
              borderRadius: '10px',
              background: '#27272a',
              color: '#fff',
              border: '1px solid #3f3f46'
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          });
        });
      }

      previousUsers.current = uniqueActiveUsers;
      setUsers(uniqueActiveUsers);
    };

    provider.awareness.on("change", updateUsers);

    provider.awareness.setLocalStateField("user", {
      name: username
    });

    new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
  };
  const renderCard = (children) => (
    <>
      <Toaster position="bottom-right" />
      <main className='h-screen w-full bg-zinc-950 text-white flex items-center justify-center relative overflow-hidden'>

        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className='z-10 bg-zinc-900/40 backdrop-blur-2xl border border-zinc-700/50 p-10 rounded-3xl shadow-2xl flex flex-col gap-6 w-full max-w-md items-center text-center'>
          {children}
        </div>
      </main>
    </>
  );

  if (currentPath !== "/" && currentPath !== "") {
    return (
      <main className='h-screen w-full bg-zinc-950 text-white flex flex-col items-center justify-center relative overflow-hidden'>
        <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className='z-10 flex flex-col items-center text-center p-8 bg-zinc-900/40 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl shadow-2xl max-w-lg w-full'>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
            <img src="/vite.svg" alt="Cat Logo" className="relative w-32 h-32 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-white mb-4">Lost in cyberspace</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">It seems you've wandered into an invalid room or page. Our deployment cat has searched everywhere, but there's nothing here but void.</p>
          <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className='w-full p-4 rounded-xl bg-indigo-600 text-white text-xl font-bold cursor-pointer hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20'>Take Me Home</button>
        </div>
      </main>
    );
  }

  if (uiState === "username") {
    return renderCard(
      <>
        <h1 className="text-4xl font-extrabold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Welcome</h1>
        <p className="text-zinc-400 mb-4">Enter a username to get started.</p>
        <form onSubmit={handleSetUsername} className="w-full flex flex-col gap-4">
          <input type="text" placeholder='Your Username' className='w-full p-4 text-center text-2xl rounded-2xl bg-zinc-950/50 border border-zinc-700/50 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-600' value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          <button type="submit" disabled={!username.trim()} className='w-full p-4 rounded-2xl bg-emerald-600 text-white text-xl font-bold cursor-pointer hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20'>Continue</button>
        </form>
      </>
    );
  }

  if (uiState === "choose") {
    return renderCard(
      <>
        <h1 className="text-3xl font-bold text-white mb-2">Hi, {username}!</h1>
        <p className="text-zinc-400 mb-4">What would you like to do?</p>
        <div className="w-full flex flex-col gap-4">
          <button onClick={handleCreateRoom} className='w-full p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 text-white text-xl font-bold cursor-pointer hover:bg-zinc-700 transition-all'>Create New Room</button>
          <div className="flex items-center gap-4 text-zinc-500 my-2">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-sm font-semibold tracking-widest">OR</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>
          <button onClick={handleJoinStart} className='w-full p-4 rounded-2xl bg-emerald-600 text-white text-xl font-bold cursor-pointer hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20'>Join Existing Room</button>
        </div>
        <button onClick={() => changeUiState("username")} className='mt-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm'>Change Username</button>
      </>
    );
  }

  if (uiState === "create") {
    return renderCard(
      <>
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">Room Created</h1>
        <p className="text-zinc-400 mb-2">Share this code to collaborate.</p>

        <div className="w-full bg-zinc-950/80 border border-zinc-700/50 rounded-2xl p-6 mb-2 flex items-center justify-between gap-4">
          <span className="text-5xl font-mono tracking-[0.2em] ml-2 text-emerald-400">{roomId}</span>
          <button onClick={() => { navigator.clipboard.writeText(roomId); toast.success("Code copied!"); }} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all" title="Copy Code">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>

        <button onClick={() => changeUiState("editor")} className='w-full p-4 rounded-2xl bg-emerald-600 text-white text-xl font-bold cursor-pointer hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 mt-2'>Enter Room</button>
        <button onClick={() => changeUiState("choose")} className='mt-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm'>Back</button>
      </>
    );
  }

  if (uiState === "join") {
    return renderCard(
      <>
        <h1 className="text-3xl font-bold text-white mb-2">Join Room</h1>
        <p className="text-zinc-400 mb-4">Enter the 4-digit room code.</p>
        <form onSubmit={handleJoinSubmit} className="w-full flex flex-col gap-4">
          <input type="text" maxLength={4} placeholder='0000' className='w-full p-4 text-center text-4xl font-mono tracking-[0.5em] indent-[0.5em] rounded-2xl bg-zinc-950/50 border border-zinc-700/50 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-700' value={roomCodeInput} onChange={(e) => setRoomCodeInput(e.target.value.replace(/\D/g, ''))} autoFocus />
          <button type="submit" disabled={roomCodeInput.length !== 4} className='w-full p-4 rounded-2xl bg-emerald-600 text-white text-xl font-bold cursor-pointer hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20'>Merge Into Room</button>
        </form>
        <button onClick={() => changeUiState("choose")} className='mt-4 text-zinc-500 hover:text-zinc-300 transition-colors text-sm'>Cancel</button>
      </>
    );
  }
  if (uiState === "editor") {
    return (
      <>
        <Toaster position="bottom-right" />
        <main className='h-screen w-full bg-zinc-950 text-white flex gap-4 p-4'>
          <div className='h-full w-1/4 rounded-2xl bg-zinc-900/80 flex flex-col overflow-hidden border border-zinc-700/50 shadow-xl backdrop-blur-md'>
            <div className="p-6 bg-zinc-950/50 border-b border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Room Code</span>
                <button onClick={handleLeaveRoom} className="text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-red-500/20 hover:border-red-500">Leave</button>
              </div>
              <div className="text-4xl font-mono tracking-[0.2em] text-emerald-400 font-light flex items-center justify-between">
                <span>{roomId}</span>
                <button onClick={() => { navigator.clipboard.writeText(roomId); toast.success("Copied!"); }} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-all" title="Copy Code">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-3 overflow-y-auto flex-1">
              <h2 className='text-xs font-bold mb-2 text-zinc-500 uppercase tracking-widest'>Connected Users • {users.length}</h2>
              {users.map((user, idx) => (
                <div key={idx} className='flex items-center gap-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 shadow-sm transition-all hover:bg-zinc-800/80'>
                  <div className='w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse'></div>
                  <span className='font-semibold text-zinc-200'>{user} <span className="text-zinc-500 text-sm font-normal">{user === username && "(You)"}</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className='h-full w-3/4 rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800 shadow-2xl'>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              defaultValue="// Start collaborating..."
              theme="vs-dark"
              onMount={handleMount}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                padding: { top: 24 }
              }}
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <main className='h-screen w-full bg-zinc-950 text-white flex flex-col items-center justify-center relative overflow-hidden'>
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className='z-10 flex flex-col items-center text-center p-8 bg-zinc-900/40 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl shadow-2xl max-w-lg w-full'>
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
          <img src="/vite.svg" alt="Cat Logo" className="relative w-32 h-32 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Lost in cyberspace</h2>
        <p className="text-zinc-400 mb-8 leading-relaxed">It seems you've wandered into an invalid room or page. Our deployment cat has searched everywhere, but there's nothing here but void.</p>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className='w-full p-4 rounded-xl bg-indigo-600 text-white text-xl font-bold cursor-pointer hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20'>Take Me Home</button>
      </div>
    </main>
  );
}

export default App
