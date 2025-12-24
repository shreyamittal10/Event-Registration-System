import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import ChatWindow from "../components/ChatWindow";

function StudentDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allEvents, setAllEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [student, setStudent] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAllEvents();
    fetchRegisteredEvents();
    fetchStudentInfo();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const res = await fetch("https://event-system-backend-cbcg.onrender.com/api/events/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch events");
      setAllEvents(data.events || []);
    } catch (err) {
      console.error(err);
      setAllEvents([]);
      alert("Error fetching events: " + err.message);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await fetch("https://event-system-backend-cbcg.onrender.com/api/events/registered", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.msg || "Failed to fetch registered events");
      setRegisteredEvents(data.events || []);
    } catch (err) {
      console.error(err);
      setRegisteredEvents([]);
      alert("Error fetching registered events: " + err.message);
    }
  };

  const getGoogleCalendarUrl = (event) => {
    const date = event.event_date.replace(/-/g, "");
  
    const time = event.event_time
      ? event.event_time.replace(/:/g, "").slice(0, 6)
      : "120000"; 
    const start = `${date}T${time}`;
  
    const hour = parseInt(time.slice(0, 2));
    const minsSecs = time.slice(2); 
  
    const endHour = String(Math.min(hour + 1, 23)).padStart(2, "0");
    const end = `${date}T${endHour}${minsSecs}`;
  
    const title = encodeURIComponent(event.title);
    const location = encodeURIComponent(event.venue || "");
    const details = encodeURIComponent("Added from Event Management System");
  
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}&details=${details}`;
  };
  

  const fetchStudentInfo = async () => {
    try {
      const res = await fetch("https://event-system-backend-cbcg.onrender.com/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch profile");
      setStudent(data.user);
    } catch (err) {
      console.error(err);
      alert("Error fetching profile: " + err.message);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const res = await fetch("https://event-system-backend-cbcg.onrender.com/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to register");
      alert("Registered successfully!");
      fetchRegisteredEvents();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  const downloadTicket = async (eventId) => {
    try {
      const res = await fetch(`https://event-system-backend-cbcg.onrender.com/api/events/${eventId}/ticket`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        throw new Error("Failed to download ticket");
      }
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket_event_${eventId}.pdf`;
      a.click();
  
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error downloading ticket");
    }
  };
  

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const eventsToDisplay =
    search.trim() === ""
      ? allEvents
      : allEvents.filter((e) =>
          e.title.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-64 bg-gray-800 flex flex-col justify-between p-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-4">Student</h2>
          <NotificationBell/>
          <button
            onClick={() => setActiveTab("home")}
            className="hover:text-blue-400 transition"
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className="hover:text-purple-400 transition"
          >
            Profile
          </button>
          
        </div>
        <button
          onClick={handleLogout}
          className="hover:text-red-500 transition self-start"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {activeTab === "home" && (
          <>
            <div className="p-4 bg-gray-900 sticky top-0 z-10 flex justify-center">
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-1/2 px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory">
              {eventsToDisplay.length === 0 && (
                <p className="text-center mt-20 text-gray-400">
                  No events found.
                </p>
              )}

{eventsToDisplay.map((event) => (
  <div
    key={event.id}
    className="snap-start flex justify-center py-6"
  >
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden w-[600px] h-[82vh] flex flex-col">

      {event.image && (
        <img
          src={event.image}
          alt={event.title}
          className="w-full max-h-1/2 object-cover"
        />
      )}

      <div className="p-4 flex-1 flex flex-col text-center">
        <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
        <p className="text-gray-400 flex-1">{event.description}</p>
        <p className="text-gray-400 mt-2 text-sm">
          📍 {event.venue || "N/A"} <br />
          📅{" "}
          {event.event_date
            ? new Date(event.event_date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A"}{" "}
          <br />
          ⏰ {event.event_time || "N/A"} <br />
          👤 {event.organizer_name || "Unknown"}
        </p>

        <button
          onClick={() => handleRegister(event.id)}
          disabled={registeredEvents.some((e) => Number(e.id) === Number(event.id))}
          className={`mt-4 px-4 py-2 rounded self-center ${
            registeredEvents.some((e) => Number(e.id) === Number(event.id))
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {registeredEvents.some((e) => Number(e.id) === Number(event.id))
            ? "Registered"
            : "Register"}
        </button>
      </div>
    </div>
  </div>
))}

            </div>
          </>
        )}

{activeTab === "profile" && student && (
  <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-8 px-4">

    <div className="flex flex-col items-center mb-8 mt-4">
      <div className="w-32 h-32 rounded-full bg-gray-500 flex items-center justify-center text-4xl font-bold text-white mb-4">
        {student.name[0].toUpperCase()}
      </div>
      <h2 className="text-3xl font-bold">{student.name}</h2>
      <p className="text-gray-400">{student.email}</p>
    </div>

    <h3 className="text-2xl font-bold mb-4 self-start">
      My Registered Events
    </h3>
    {registeredEvents.length === 0 ? (
      <p className="text-gray-400 mb-8">No registered events yet.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {registeredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-2">
              <h4 className="font-semibold text-white">{event.title}</h4>
              <p className="text-gray-400 text-sm">
                📅{" "}
                {event.event_date
                  ? new Date(event.event_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
              <button
  onClick={() => downloadTicket(event.id)}
  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm rounded"
>
  🎫 Download Ticket
</button>
<a
  href={getGoogleCalendarUrl(event)}
  target="_blank"
  rel="noopener noreferrer"
>
  <button className="mt-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-sm rounded">
    📅 Add to Google Calendar
  </button>
</a>
<button
  onClick={() => setActiveChat({ eventId: event.id, otherUserId: event.organizer_id, otherName: event.organizer_name })}
  className="mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-sm rounded"
>
  💬 Chat with organizer
</button>



            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      </div>

      {activeChat && (
  <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-center items-center z-50">
    <div className="bg-gray-800 w-[450px] h-[600px] rounded-xl shadow-lg p-4">
      <ChatWindow
        eventId={activeChat.eventId}
        otherUserId={activeChat.otherUserId}
        otherName={activeChat.otherName}
        currentUserId={Number(student?.id)}
        onClose={() => setActiveChat(null)}
      />
    </div>
  </div>
)}

      {activeTab === "home" && (
        <div className="w-64 bg-gray-800 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">My Registered Events</h2>
          {registeredEvents.length === 0 ? (
            <p className="text-gray-400">No registered events yet.</p>
          ) : (
            <div className="space-y-4">
              {registeredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-700 rounded-lg p-3 shadow-md hover:bg-gray-600"
                >
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-300">
                    📅{" "}
                    {event.event_date
                      ? new Date(event.event_date).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" }
                        )
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-300">⏰ {event.event_time || "N/A"}</p>
                  <p className="text-sm text-gray-300">📍 {event.venue || "N/A"}</p>
                  <button
  onClick={() => downloadTicket(event.id)}
  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm rounded"
>
  🎫 Download Ticket
</button>

                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
