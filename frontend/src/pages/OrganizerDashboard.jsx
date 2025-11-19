import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [createdEvents, setCreatedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);


  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCreatedEvents();
    fetchAllEvents();
  }, []);

  const fetchCreatedEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/created", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch created events");
      setCreatedEvents(data.events || []);
    } catch (err) {
      console.error(err);
      setCreatedEvents([]);
      alert("Error fetching created events: " + err.message);
    }
  };

  const fetchAllEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/all", {
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleCreateEvent = () => {
    navigate("/organizer/create-event");
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
          <h2 className="text-2xl font-bold mb-4">Organizer</h2>
          <NotificationBell />
          <button
            onClick={() => navigate("/organizer")}
            className="hover:text-blue-400 transition"
          >
            Home
          </button>
          <button
            onClick={handleCreateEvent}
            className="hover:text-green-400 transition"
          >
            Create Event
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
            <p className="text-center mt-20 text-gray-400">No events found.</p>
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
                    className="w-full h-2/3 object-cover"
                  />
                )}
                <div className="p-4 flex-1 flex flex-col text-center">
                  <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-400 flex-1">{event.description}</p>
                  <p className="text-gray-400 mt-2 text-sm">
  📍 {event.venue || "N/A"} <br />
  📅 {event.event_date ? new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"} <br />
  ⏰ {event.event_time || "N/A"} <br />
  👤 {event.organizer_name || "Unknown"}
</p>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-64 bg-gray-800 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">My Created Events</h2>
        {createdEvents.length === 0 ? (
          <p className="text-gray-400">No events created yet.</p>
        ) : (
          <ul className="space-y-2">
            {createdEvents.map((event) => (
              <li
                key={event.id}
                className="bg-gray-700 p-3 rounded flex justify-between items-center cursor-pointer hover:bg-gray-600"
                onClick={() => navigate(`/organizer/event/${event.id}`)}
              >
                {event.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default OrganizerDashboard;
