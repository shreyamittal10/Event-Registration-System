import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateEventPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    venue: "",
    event_date: "",
    event_time: "",
  });
  const [error, setError] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to create event");

      alert("Event created successfully!");
      navigate("/organizer");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleAIDescription = async (optimize = false) => {
    setLoadingAI(true);
    setError("");
  
    try {
      const res = await fetch("http://localhost:5000/api/ai/event-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          venue: formData.venue,
          event_date: formData.event_date,
          event_time: formData.event_time,
          description: optimize ? formData.description : "",
        }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "AI failed");
  
      setFormData((prev) => ({
        ...prev,
        description: data.description,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAI(false);
    }
  };  

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Create New Event</h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white"
              required
            />
          </div>
          
<div>
  <label className="block mb-1">Description</label>

  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
    rows={5}
    required
  />

  <div className="flex gap-2 mt-2">
    <button
      type="button"
      disabled={loadingAI}
      onClick={() => handleAIDescription(false)}
      className="px-3 py-1 bg-indigo-600 rounded text-sm hover:bg-indigo-700"
    >
      {loadingAI ? "Generating..." : "✨ Generate with AI"}
    </button>

    <button
      type="button"
      disabled={loadingAI || !formData.description}
      onClick={() => handleAIDescription(true)}
      className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-700"
    >
      🔧 Optimize
    </button>
  </div>
</div>


          <div>
            <label className="block mb-1">Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block mb-1">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1">Date</label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1">Time</label>
              <input
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-600 rounded hover:bg-green-700 transition"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEventPage;
