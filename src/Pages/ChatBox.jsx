import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, role: "ai", text: "Ask me anything." },
  ]);
  const [isSending, setIsSending] = useState(false);

  const listRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "";

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMsg = { id: Date.now(), role: "user", text: trimmed };
    const aiMsgId = userMsg.id + 1;
    setMessages((m) => [
      ...m,
      userMsg,
      { id: aiMsgId, role: "ai", text: "..." },
    ]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        res.ok && data?.reply ? data.reply : "Server error. Try again.";

      setMessages((m) =>
        m.map((msg) => (msg.id === aiMsgId ? { ...msg, text: reply } : msg))
      );
    } catch (err) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, text: "Network error. Check the server." }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="w-full max-w-md h-[70vh] bg-slate-100 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-4 py-3 bg-blue-600 text-white font-semibold">
          AI Assistant
        </header>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 max-w-[75%] text-sm rounded-lg ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 border"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-slate-50">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={isSending}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}