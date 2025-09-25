import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [registeredStudents, setRegisteredStudents] = useState([]);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch event");
      setEvent(data.event);
      setRegisteredStudents(data.registeredStudents);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to delete");
      alert("Event deleted");
      navigate("/organizer");
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  if (!event) return <p className="text-white text-center mt-20">Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 flex flex-col justify-between p-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-4">Organizer</h2>
          <button onClick={() => navigate("/organizer")} className="hover:text-blue-400 transition">Home</button>
          <button onClick={() => navigate("/organizer/create-event")} className="hover:text-green-400 transition">Create Event</button>
        </div>
        <button onClick={() => { localStorage.clear(); navigate("/"); }} className="hover:text-red-500 transition self-start">Logout</button>
      </div>

      {/* Center Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-64 object-cover" />
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-gray-400 mb-4">{event.description}</p>
            <div className="flex gap-6 text-gray-300 mb-6">
              <span>📍 {event.venue || "Not specified"}</span>
              <span>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : "Not specified"}</span>
              <span>⏰ {event.event_time || "Not specified"}</span>
            </div>

            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded text-white">
              Delete Event
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Registered Students */}
      <div className="w-64 bg-gray-800 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Registered Students ({registeredStudents.length})</h2>
        <div className="flex flex-col gap-3">
          {registeredStudents.map((s) => (
            <div key={s.id} className="flex items-center gap-3 bg-gray-700 p-2 rounded">

              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-sm font-semibold text-white">
                {s.avatar ? (
                  <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  s.name[0].toUpperCase()
                )}
              </div>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;
