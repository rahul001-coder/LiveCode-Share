import { motion } from "framer-motion";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AnimatedForm() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roomId.trim() || !username.trim()) {
      alert("Please enter both Room ID and Username");
      return;
    }

    // ✅ store locally
    localStorage.setItem("username", username);
    localStorage.setItem("roomId", roomId);

    // ✅ navigate with username
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  const handleCreateRoom = () => {
    const newRoomId = uuidv4().split("-")[0];
    setRoomId(newRoomId);
    alert(`Created Room: ${newRoomId}`);
    toast.success("Room Created Successfully");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden px-4">
      <svg className="absolute w-0 h-0">
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 20 -10"
          />
          <feBlend in="SourceGraphic" in2="blur" />
        </filter>
      </svg>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="p-10 bg-white rounded-3xl shadow-2xl relative z-10 max-w-md w-full"
        style={{ filter: "url(#goo)" }}
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">
          🧪 Gooey Room Join
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Room ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 rounded-full bg-indigo-600 text-white font-semibold shadow-md transition"
          >
            Join Now
          </motion.button>

          <div className="text-center mt-2 text-sm text-gray-600">
            Don’t have a room?{" "}
            <button
              type="button"
              onClick={handleCreateRoom}
              className="text-indigo-600 hover:underline font-medium"
            >
              Create New Room
            </button>
          </div>
        </form>
      </motion.div>

      {/* Gooey background blobs */}
      <motion.div
        className="absolute w-72 h-72 bg-indigo-500 rounded-full top-1/3 left-1/4 opacity-40 blur-3xl"
        animate={{ x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        style={{ filter: "url(#goo)" }}
      />
      <motion.div
        className="absolute w-72 h-72 bg-purple-500 rounded-full bottom-1/3 right-1/4 opacity-40 blur-3xl"
        animate={{ x: [0, -30, 30, 0], y: [0, 30, -30, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        style={{ filter: "url(#goo)" }}
      />
    </div>
  );
}
