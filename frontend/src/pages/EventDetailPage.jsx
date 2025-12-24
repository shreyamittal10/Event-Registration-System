import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [activeChat, setActiveChat] = useState(null); 

const organizerId = token ? JSON.parse(atob(token.split(".")[1])).id : null;


  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`https://event-system-backend-cbcg.onrender.com/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch event");
      setEvent(data.event);
      setRegisteredStudents(data.registeredStudents || []);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  const handleDeleteClick = () => {
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!window.confirm("Are you sure? This will permanently delete the event.")) return;
    setLoadingDelete(true);
    try {
      const res = await fetch(`https://event-system-backend-cbcg.onrender.com/api/events/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: deleteReason?.trim() || null }),
      });
      const data = await res.json();
      setLoadingDelete(false);
      if (!res.ok) throw new Error(data.msg || "Failed to delete");
      alert("Event deleted");
      setShowDeleteModal(false);
      navigate("/organizer");
    } catch (err) {
      setLoadingDelete(false);
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  if (!event) return <p className="text-white text-center mt-20">Loading...</p>;

  return (
    <>
      <div className="flex h-screen bg-gray-900 text-white">
        <div className="w-64 bg-gray-800 flex flex-col justify-between p-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold mb-4">Organizer</h2>
            <button onClick={() => navigate("/organizer")} className="hover:text-blue-400 transition">Home</button>
            <button onClick={() => navigate("/organizer/create-event")} className="hover:text-green-400 transition">Create Event</button>
          </div>
          <button onClick={() => { localStorage.clear(); navigate("/"); }} className="hover:text-red-500 transition self-start">Logout</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {event.image && (
              <img src={event.image} alt={event.title} className="w-full h-64 object-cover" />
            )}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <p className="text-gray-400 mb-4">{event.description}</p>
              <div className="flex gap-6 text-gray-300 mb-6">
                <span>📍 {event.venue || "Not specified"}</span>
                <span>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : "Not specified"}</span>
                <span>⏰ {event.event_time || "Not specified"}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={handleDeleteClick} className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded text-white">
                  Delete Event
                </button>
                <button onClick={() => navigate("/organizer")} className="bg-gray-600 hover:bg-gray-500 transition px-4 py-2 rounded text-white">
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-80 bg-gray-800 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Registered Students ({registeredStudents.length})</h2>
          <div className="flex flex-col gap-3">
          {registeredStudents.map((s) => (
  <div key={s.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
    
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-sm font-semibold text-white">
        {s.name ? s.name[0].toUpperCase() : "?"}
      </div>

      <div>
        <div className="font-medium">{s.name}</div>
        <div className="text-sm text-gray-300">{s.email}</div>
      </div>
    </div>

    <button
      onClick={() =>
        setActiveChat({
          eventId: event.id,
          otherUserId: s.id,
          otherName: s.name,
        })
      }
      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
    >
      💬
    </button>
  </div>
))}

          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 text-black">
            <h3 className="text-xl font-semibold mb-3">Delete Event</h3>
            <p className="text-sm text-gray-600 mb-3">Optional: Provide a reason for deleting the event.</p>

            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Reason for deleting (optional)..."
              className="w-full p-3 border border-gray-300 rounded mb-4 resize-none"
              rows={4}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded border border-gray-300 text-white">Cancel</button>
              <button
                onClick={confirmDelete}
                disabled={loadingDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {loadingDelete ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

{activeChat && (
  <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex justify-center items-center z-50">
    <div className="bg-gray-800 w-[450px] h-[600px] rounded-xl shadow-lg p-4">
      <ChatWindow
        eventId={activeChat.eventId}
        otherUserId={activeChat.otherUserId}
        otherName={activeChat.otherName}
        currentUserId={Number(organizerId)}  
        onClose={() => setActiveChat(null)}
      />
    </div>
  </div>
)}

    </>
  );
}

export default EventDetailPage;
