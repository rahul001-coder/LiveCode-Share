import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import Avatar from "react-avatar";
import { Menu, Play, ChevronDown, ChevronUp } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { io } from "socket.io-client";
import axios from "axios";

const SOCKET_SERVER_URL = "http://localhost:3000";
const BACKEND_API_URL = "http://localhost:5000/api/code/execute";

export const Editor = () => {
  const socketRef = useRef(null);
  const { roomId } = useParams();
  const location = useLocation();
  const [input, setInput] = useState(location.state?.input || "");
  const [users, setUsers] = useState([]);
  const [language, setLanguage] = useState("cpp");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [isOutputOpen, setIsOutputOpen] = useState(true);

  const username =
    location.state?.username ||
    localStorage.getItem("username") ||
    `User-${Math.floor(Math.random() * 1000)}`;

  // ================= SOCKET INIT =================
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected:", socketRef.current.id);
      socketRef.current.emit("join-room", { roomId, username });
    });

    socketRef.current.on("user-joined", ({ clients }) => setUsers(clients));
    socketRef.current.on("code-update", ({ code }) => setCode(code));
    socketRef.current.on("user-left", ({ socketId }) =>
      setUsers((prev) => prev.filter((u) => u.socketId !== socketId))
    );

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [roomId, username]);

  // ================= CODE CHANGE HANDLER =================
  const handleCodeChange = (value) => {
    setCode(value);
    socketRef.current.emit("code-change", { roomId, code: value });
  };

  // ================= RUN CODE =================
  const handleRun = async () => {
    setIsRunning(true);
    setOutput("⏳ Running...");

    const languageMap = {
      cpp: 54,
      java: 62,
      python: 71,
      javascript: 63,
    };

    try {
      const res = await axios.post(BACKEND_API_URL, {
        languageId: languageMap[language],
        sourceCode: code,
        stdin: input || "",
      });

      const data = res.data;
      if (data.stdout) setOutput(data.stdout);
      else if (data.stderr) setOutput(data.stderr);
      else if (data.compile_output)
        setOutput("⚠️ Compilation Error:\n" + data.compile_output);
      else if (data.error)
        setOutput("❌ Runtime Error:\n" + JSON.stringify(data.error, null, 2));
      else setOutput("⚠️ No output");
    } catch (err) {
      setOutput(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // ================= TYPING INDICATOR =================
  useEffect(() => {
    if (!socketRef.current) return;

    const handleTyping = () => {
      socketRef.current.emit("user-typing", { roomId, username });
    };

    document.addEventListener("keydown", handleTyping);

    socketRef.current.on("user-typing", ({ username: typingUsername }) => {
      if (typingUsername !== username) {
        setTypingUser(typingUsername);
        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => setTypingUser(""), 2000);
      }
    });

    return () => {
      document.removeEventListener("keydown", handleTyping);
      socketRef.current.off("user-typing");
    };
  }, [username, roomId]);

  // ================= UI =================
  return (
    <div className="flex flex-col h-screen relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white">
        <h1 className="text-sm font-semibold">Realtime Code Editor</h1>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 bg-green-600 px-3 py-1 rounded-full text-sm hover:bg-green-500"
            onClick={handleRun}
            disabled={isRunning}
          >
            <Play size={16} />
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            className="bg-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-600"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            <Menu size={16} />
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex flex-1">
        <div className="w-full relative">
          {typingUser && (
            <div className="absolute top-2 left-4 text-gray-600 text-sm bg-white/70 px-3 py-1 rounded-full shadow">
              ✏️ {typingUser} is typing...
            </div>
          )}

          <CodeMirror
            value={code}
            height="calc(100vh - 200px)"
            theme="light"
            extensions={[
              language === "cpp"
                ? cpp()
                : language === "python"
                ? python()
                : language === "java"
                ? java()
                : javascript(),
            ]}
            onChange={handleCodeChange}
          />
        </div>

        {/* Sidebar */}
        <div
          className={`bg-gray-900 text-white transition-all duration-300 ${
            isSidebarOpen ? "w-60 p-4" : "w-0 p-0"
          }`}
        >
          {isSidebarOpen && (
            <>
              <h2 className="text-sm font-semibold mb-2">Language</h2>
              <div className="mb-3">
                {["cpp", "java", "python", "javascript"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`text-[10px] px-2 py-0.5 rounded-full mr-1 mb-1 ${
                      language === lang
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <h2 className="text-sm font-semibold mb-2">Users</h2>
              <ul className="space-y-2">
                {users.map((u, i) => (
                  <li key={i} className="flex items-center">
                    <Avatar name={u.username} size="25" textSizeRatio={1.75} />
                    <span className="ml-2">{u.username}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Output Panel */}
      <div className="bg-black text-green-400 font-mono border-t border-gray-800">
        {/* Header with toggle arrow */}
        <div
          className="flex items-center justify-between px-4 py-2 cursor-pointer select-none bg-gray-900 text-white"
          onClick={() => setIsOutputOpen((prev) => !prev)}
        >
          <h2 className="text-sm font-semibold">Output</h2>
          {isOutputOpen ? (
            <ChevronUp size={18} className="text-gray-300" />
          ) : (
            <ChevronDown size={18} className="text-gray-300" />
          )}
        </div>

        {/* Collapsible content */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            isOutputOpen ? "max-h-150 p-3" : "max-h-0 p-0"
          }`}
        > <div>
          <h1> Input here </h1>
          <input
            type="text"
            className="w-full mb-2 p-1 text-amber-100 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
          
          <pre className="text-green-400 text-sm whitespace-pre-wrap">
            {output || "No output yet..."}
          </pre>
        </div>
      </div>
    </div>
  );
};
