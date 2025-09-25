import { pool } from "../index.js";

// Create Event
export const createEvent = async (req, res) => {
    const { title, description, image, venue, event_date, event_time } = req.body;
  
    try {
      const result = await pool.query(
        `INSERT INTO events 
         (title, description, image, venue, event_date, event_time, organizer_id) 
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [title, description, image, venue, event_date, event_time, req.user.id]
      );
      res.json({ event: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
    }
  };
  
  

// Organizer's created events
export const getCreatedEvents = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events WHERE organizer_id=$1 ORDER BY id DESC",
      [req.user.id]
    );
    res.json({ events: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

// Fetch all events created by others
export const getAllEvents = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT e.*, u.name as organizer_name 
         FROM events e
         JOIN users u ON u.id = e.organizer_id
         WHERE e.organizer_id != $1
         ORDER BY e.id DESC`,
        [req.user.id]
      );
      res.json({ events: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
    }
  };

  
  export const registerForEvent = async (req, res) => {
    const { eventId } = req.body;
    try {
      await pool.query(
        `INSERT INTO registrations (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [eventId, req.user.id]
      );
      res.json({ msg: "Registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
    }
  };
  


  export const getEventDetails = async (req, res) => {
    const eventId = req.params.id;
    try {
      const eventRes = await pool.query(
        `SELECT id, title, description, image, venue, event_date, event_time 
         FROM events WHERE id=$1`,
        [eventId]
      );
  
      if (eventRes.rows.length === 0) 
        return res.status(404).json({ msg: "Event not found" });
  
      const registrationsRes = await pool.query(
        `SELECT u.id, u.name, u.email 
         FROM registrations r 
         JOIN users u ON u.id = r.user_id 
         WHERE r.event_id=$1`,
        [eventId]
      );
  
      res.json({
        event: eventRes.rows[0],
        registeredStudents: registrationsRes.rows
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
    }
  };
  
  
  // Delete Event
export const deleteEvent = async (req, res) => {
    const eventId = req.params.id;
  
    try {
      const eventCheck = await pool.query(
        "SELECT * FROM events WHERE id = $1 AND organizer_id = $2",
        [eventId, req.user.id]
      );
  
      if (eventCheck.rows.length === 0) {
        return res.status(403).json({ msg: "You are not authorized to delete this event or it does not exist." });
      }
  
      await pool.query(
        "DELETE FROM registrations WHERE event_id = $1",
        [eventId]
      );
  
      await pool.query(
        "DELETE FROM events WHERE id = $1",
        [eventId]
      );
  
      res.json({ msg: "Event deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  };


  // Student's registered events
export const getRegisteredEvents = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT e.*, u.name as organizer_name
         FROM registrations r
         JOIN events e ON e.id = r.event_id
         JOIN users u ON u.id = e.organizer_id
         WHERE r.user_id = $1
         ORDER BY e.id DESC`,
        [req.user.id]
      );
      res.json({ events: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
    }
  };
  