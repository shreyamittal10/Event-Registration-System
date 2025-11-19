import { pool } from "../index.js";

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
        `INSERT INTO registrations (event_id, user_id) 
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [eventId, req.user.id]
      );
  
      const eventRes = await pool.query(
        `SELECT title, organizer_id 
         FROM events 
         WHERE id = $1`,
        [eventId]
      );
  
      const eventTitle = eventRes.rows[0]?.title || "an event";
      const organizerId = eventRes.rows[0]?.organizer_id;
  
      const userRes = await pool.query(
        `SELECT name FROM users WHERE id = $1`,
        [req.user.id]
      );
  
      const attendeeName = userRes.rows[0]?.name || "Someone";
  
      await pool.query(
        `INSERT INTO notifications (user_id, message)
         VALUES ($1, $2)`,
        [
          req.user.id,
          `Successfully registered for ${eventTitle}`,
        ]
      );

      await pool.query(
        `INSERT INTO notifications (user_id, message, data)
         VALUES ($1, $2, $3)`,
        [
          organizerId,
          `${attendeeName} registered for your event: ${eventTitle}`,
          JSON.stringify({
            eventId: Number(eventId),
            attendeeName,
            eventTitle
          })
        ]
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
  
  
  
export const deleteEvent = async (req, res) => {
  const eventId = req.params.id;
  const { reason } = req.body || {};

  try {
    const eventCheck = await pool.query(
      "SELECT id, title, organizer_id FROM events WHERE id = $1 AND organizer_id = $2",
      [eventId, req.user.id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ msg: "You are not authorized to delete this event or it does not exist." });
    }

    const eventTitle = eventCheck.rows[0].title;
    const organizerId = eventCheck.rows[0].organizer_id;

    const orgRes = await pool.query("SELECT name FROM users WHERE id = $1", [organizerId]);
    const organizerName = orgRes.rows[0]?.name || "Organizer";

    const studentsRes = await pool.query(
      `SELECT u.id AS user_id, u.name, u.email
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE r.event_id = $1`,
      [eventId]
    );

    for (const s of studentsRes.rows) {
      const studentMsg = `${organizerName} deleted the event: ${eventTitle}`;
      const dataObj = {
        eventId: Number(eventId),
        eventTitle,
        organizerName,
        reason: reason || null,
      };

      await pool.query(
        `INSERT INTO notifications (user_id, message, data)
         VALUES ($1, $2, $3)`,
        [s.user_id, studentMsg, dataObj]
      );
    }

    const organizerMsg = `You deleted the event: ${eventTitle}`;
    await pool.query(
      `INSERT INTO notifications (user_id, message, data)
       VALUES ($1, $2, $3)`,
      [organizerId, organizerMsg, { eventId: Number(eventId), eventTitle, reason: reason || null }]
    );

    await pool.query("DELETE FROM registrations WHERE event_id = $1", [eventId]);

    await pool.query("DELETE FROM events WHERE id = $1", [eventId]);

    res.json({ msg: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

  export const getRegisteredEvents = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            e.id,
            e.title,
            e.description,
            e.image,
            e.venue,
            to_char(e.event_date, 'YYYY-MM-DD') AS event_date,
            to_char(e.event_time, 'HH24:MI:SS') AS event_time,
            e.organizer_id,
            u.name AS organizer_name
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
  