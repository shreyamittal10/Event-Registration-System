import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";

function App() {
  console.log("App rendering");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/organizer/event/:id" element={<EventDetailPage />} />
        <Route path="/organizer/create-event" element={<CreateEventPage />} />
      </Routes>
    </Router>
  );
}

export default App;
