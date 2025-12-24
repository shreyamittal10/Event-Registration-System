import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("https://event-system-backend-cbcg.onrender.com/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`https://event-system-backend-cbcg.onrender.com/api/notifications/read/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <FaBell className="text-white text-xl" /> {/* smaller bell */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute w-80 bg-gray-800 text-white rounded-lg shadow-lg p-3 z-50 border border-gray-700">
          <h3 className="font-semibold border-b border-gray-600 pb-2 mb-2">
            Notifications
          </h3>

          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm py-2">No notifications.</p>
          ) : (
            notifications.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-md cursor-pointer mb-2 ${
                  note.is_read ? "bg-gray-700" : "bg-gray-600"
                }`}
                onClick={() => markAsRead(note.id)}
              >
                <p className="text-sm font-medium">{note.message}</p>

                {note.data?.reason && (
                  <p className="text-xs mt-1 text-red-300 italic">
                    Reason: {note.data.reason}
                  </p>
                )}

                <span className="text-xs text-gray-300 block mt-1">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
