import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function ChatWindow({ eventId, otherUserId, otherName, onClose, currentUserId }) {
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    const s = io("https://event-system-backend-cbcg.onrender.com", { auth: { token } });
    setSocket(s);

    s.on("connect", () => {
      s.emit("join_room", { eventId });
    });

    s.on("room_history", (history) => {
      setMessages(history);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    s.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    s.on("error_message", (err) => {
      console.error("Socket error", err);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [eventId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`https://event-system-backend-cbcg.onrender.com/api/chats/${eventId}/messages?withUser=${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setMessages(data.messages || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [eventId, otherUserId]);

  const send = () => {
    if (!text.trim()) return;
    socket.emit("send_message", { eventId, message: text.trim(), receiverId: otherUserId });
    setText("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-800 p-3 rounded">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-bold">{otherName}</div>
          <div className="text-sm text-gray-400">Event ID: {eventId}</div>
        </div>
        <button onClick={onClose} className="text-white">Close</button>
      </div>

      <div className="flex-1 overflow-auto mb-2 space-y-2">
        {messages.map((m) => (
          <div
          key={m.id}
          className={`max-w-[80%] p-2 rounded ${
            Number(m.sender_id) === Number(currentUserId)
              ? "bg-green-600 self-end ml-auto"
              : "bg-gray-700 self-start"
          }`}
        >        
            <div className="text-sm">{m.message}</div>
            <div className="text-xs text-gray-300 mt-1">{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 px-3 py-2 rounded bg-gray-900" placeholder="Type a message..." />
        <button onClick={send} className="px-4 py-2 bg-blue-600 rounded">Send</button>
      </div>
    </div>
  );
}
