import React, { useState } from "react";
import API from "../api/api";

export default function Chatbot() {
    const [messages, setMessages] = useState([
        { from: "bot", text: "Hello! Tell me your symptoms." }
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userText = input.trim();
        setMessages(prev => [...prev, { from: "user", text: userText }]);
        setInput("");
        setLoading(true);

        try {
            const response = await API.post("/chat", { message: userText });
            const botReply = response.data.reply;

            setMessages(prev => [...prev, { from: "bot", text: botReply }]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { from: "bot", text: "Error connecting to server. Try again!" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            width: "350px",
            background: "white",
            borderRadius: "12px",
            padding: "15px",
            boxShadow: "0 0 12px rgba(0,0,0,0.1)"
        }}>
            <h3 style={{ marginBottom: "10px" }}>Health Assistant</h3>

            <div style={{
                height: "320px",
                overflowY: "auto",
                padding: "10px",
                background: "#f5f5f5",
                borderRadius: "10px",
                marginBottom: "10px"
            }}>
                {messages.map((m, idx) => (
                    <div key={idx} style={{
                        textAlign: m.from === "user" ? "right" : "left",
                        margin: "8px 0"
                    }}>
                        <span style={{
                            background: m.from === "user" ? "#007bff" : "#eee",
                            color: m.from === "user" ? "white" : "black",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            display: "inline-block"
                        }}>
                            {m.text}
                        </span>
                    </div>
                ))}

                {loading && (
                    <div style={{ marginTop: "5px", fontStyle: "italic" }}>
                        Typing…
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type your symptoms..."
                    style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc"
                    }}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                />

                <button
                    onClick={sendMessage}
                    style={{
                        padding: "10px 15px",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "8px"
                    }}
                >
                    ➤
                </button>
            </div>
        </div>
    );
}
