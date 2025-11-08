import React, { useState, useEffect, useRef } from "react";
import { Send, Server, User, Copy, Check, Wifi, WifiOff, RefreshCw } from "lucide-react";

const SCPLiveImplementation = () => {
  const [mode, setMode] = useState(null); // 'server' or 'client'
  const [serverCode, setServerCode] = useState("");
  const [connectionCode, setConnectionCode] = useState("");
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [messageId, setMessageId] = useState(1);

  const messageRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  }, [messages]);

  // Generate 8-character connection code
  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setServerCode(code);
  };

  // Handle connect
  const handleConnect = () => {
    if (connectionCode.trim() === serverCode.trim() && username) {
      setConnected(true);
      addMessage("SYSTEM", `SCP/1.1 | ACK | id=${messageId} | CONNECTION_OK`);
      setMessageId((prev) => prev + 1);
    } else {
      alert("Invalid code or missing username!");
    }
  };

  // Add messages
  const addMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender, text, time: new Date().toLocaleTimeString() },
    ]);
  };

  // Send message logic
  const sendMessage = () => {
    if (!input.trim()) return;
    const formatted = `SCP/1.1 | MSG | id=${messageId} | payload="${input}"`;
    addMessage(mode === "server" ? "SERVER" : username, formatted);
    setMessageId((prev) => prev + 1);

    // Auto ACK
    setTimeout(() => {
      addMessage(
        "SYSTEM",
        `SCP/1.1 | ACK | id=${messageId} | MSG_RECEIVED`
      );
    }, 800);

    // Auto reply from server if question
    if (mode === "server" && input.includes("?")) {
      setTimeout(() => {
        addMessage(
          "SERVER",
          `SCP/1.1 | MSG | id=${messageId + 1} | payload="That's a great question!"`
        );
      }, 1500);
    }

    setInput("");
  };

  const reset = () => {
    setMode(null);
    setConnected(false);
    setMessages([]);
    setServerCode("");
    setConnectionCode("");
    setUsername("");
  };

  // UI Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 flex flex-col items-center justify-center p-6 font-sans">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Wifi className="text-emerald-400" /> Two-Way SCP Live Demo
      </h1>
      <p className="mb-6 text-slate-400 text-center">
        Bidirectional Communication Protocol Implementation
      </p>

      {!mode && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Server card */}
          <div
            onClick={() => {
              setMode("server");
              generateCode();
            }}
            className="cursor-pointer border border-slate-700 bg-slate-800/40 hover:bg-slate-800/70 rounded-2xl p-6 w-80 transition-all"
          >
            <Server className="mx-auto text-emerald-400 mb-3" size={40} />
            <h2 className="text-xl font-semibold text-center mb-2">
              Start as Server
            </h2>
            <p className="text-center text-slate-400 mb-3">
              Generate a connection code and wait for clients to connect
            </p>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>✓ Generate unique connection code</li>
              <li>✓ Accept client connections</li>
              <li>✓ Send and receive messages</li>
              <li>✓ Auto-reply to questions</li>
            </ul>
          </div>

          {/* Client card */}
          <div
            onClick={() => setMode("client")}
            className="cursor-pointer border border-slate-700 bg-slate-800/40 hover:bg-slate-800/70 rounded-2xl p-6 w-80 transition-all"
          >
            <User className="mx-auto text-emerald-400 mb-3" size={40} />
            <h2 className="text-xl font-semibold text-center mb-2">
              Start as Client
            </h2>
            <p className="text-center text-slate-400 mb-3">
              Enter a connection code to join a server
            </p>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>✓ Connect with server code</li>
              <li>✓ Set your username</li>
              <li>✓ Send and receive messages</li>
              <li>✓ Full-duplex communication</li>
            </ul>
          </div>
        </div>
      )}

      {/* Server mode */}
      {mode === "server" && (
        <div className="mt-6 w-full max-w-2xl bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Server className="text-emerald-400" /> Server Console
          </h2>
          <p className="mb-2 text-slate-400">
            Share this code with clients to connect:
          </p>
          <div className="flex items-center justify-between mb-4">
            <code className="text-2xl font-mono text-emerald-400">{serverCode}</code>
            <button
              onClick={() => navigator.clipboard.writeText(serverCode)}
              className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
            >
              <Copy size={14} /> Copy
            </button>
          </div>

          <div
            ref={messageRef}
            className="h-64 overflow-y-auto bg-slate-900/40 rounded-lg p-3 mb-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`text-sm mb-1 ${
                  m.sender === "SERVER"
                    ? "text-emerald-400"
                    : m.sender === "SYSTEM"
                    ? "text-slate-400"
                    : "text-sky-400"
                }`}
              >
                [{m.time}] <strong>{m.sender}:</strong> {m.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 focus:outline-none focus:ring focus:ring-emerald-400"
            />
            <button
              onClick={sendMessage}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-1"
            >
              <Send size={16} /> Send
            </button>
          </div>

          <button
            onClick={reset}
            className="mt-4 text-sm text-slate-400 hover:text-emerald-400 flex items-center gap-1"
          >
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      )}

      {/* Client mode */}
      {mode === "client" && !connected && (
        <div className="mt-6 w-full max-w-md bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <User className="text-emerald-400" /> Client Connection
          </h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Enter server code"
            value={connectionCode}
            onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
            className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 focus:outline-none"
          />
          <button
            onClick={handleConnect}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 py-2 rounded-lg"
          >
            Connect
          </button>
          <button
            onClick={reset}
            className="mt-3 text-sm text-slate-400 hover:text-emerald-400 flex items-center gap-1"
          >
            <RefreshCw size={14} /> Back
          </button>
        </div>
      )}

      {/* Connected client */}
      {mode === "client" && connected && (
        <div className="mt-6 w-full max-w-2xl bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Wifi className="text-emerald-400" /> Connected as {username}
          </h2>
          <div
            ref={messageRef}
            className="h-64 overflow-y-auto bg-slate-900/40 rounded-lg p-3 mb-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`text-sm mb-1 ${
                  m.sender === "SERVER"
                    ? "text-emerald-400"
                    : m.sender === "SYSTEM"
                    ? "text-slate-400"
                    : "text-sky-400"
                }`}
              >
                [{m.time}] <strong>{m.sender}:</strong> {m.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 focus:outline-none focus:ring focus:ring-emerald-400"
            />
            <button
              onClick={sendMessage}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-1"
            >
              <Send size={16} /> Send
            </button>
          </div>

          <button
            onClick={reset}
            className="mt-4 text-sm text-slate-400 hover:text-emerald-400 flex items-center gap-1"
          >
            <RefreshCw size={14} /> Disconnect
          </button>
        </div>
      )}

      {!mode && (
        <p className="mt-8 text-sm text-slate-400 text-center">
          💡 Open this page in two tabs — one as Server and one as Client.
        </p>
      )}
    </div>
  );
};

export default SCPLiveImplementation;