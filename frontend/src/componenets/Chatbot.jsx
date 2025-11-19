import React, { useState } from "react";
import { Send, X, BotMessageSquare } from "lucide-react";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your AI Health Assistant. Tell me your symptoms." }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      const botMsg = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn't reach the server." }
      ]);
    }

    setInput("");
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
      >
        <BotMessageSquare size={26} />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-xl shadow-xl border flex flex-col overflow-hidden z-50">
          <div className="flex justify-between items-center p-3 bg-blue-600 text-white">
            <h3 className="font-semibold">Health Chatbot</h3>
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="p-3 h-80 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-white border"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-3 flex items-center border-t bg-white">
            <input
              className="flex-1 border rounded-lg px-3 py-2 mr-2"
              placeholder="Type symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white p-3 rounded-lg"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
