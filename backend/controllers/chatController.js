import { pool } from "../index.js";

export const getChats = async (req, res) => {
  const userId = req.user.id;
  try {
    const q = `
      SELECT
        e.id AS event_id,
        e.title AS event_title,
        u.id AS other_user_id,
        u.name AS other_user_name,
        m.message AS last_message,
        m.created_at AS last_at
      FROM events e
      LEFT JOIN LATERAL (
        SELECT * FROM messages m2
        WHERE m2.event_id = e.id
        ORDER BY m2.created_at DESC
        LIMIT 1
      ) m ON true
      LEFT JOIN users u ON ( (m.sender_id = $1 AND u.id = m.receiver_id) OR (m.receiver_id = $1 AND u.id = m.sender_id) )
      WHERE e.id IN (
        -- events where user is organizer
        SELECT id FROM events WHERE organizer_id = $1
        UNION
        -- events where user is registered
        SELECT e2.id FROM events e2 JOIN registrations r ON r.event_id = e2.id WHERE r.user_id = $1
      )
      ORDER BY m.created_at DESC NULLS LAST
    `;
    const result = await pool.query(q, [userId]);
    res.json({ chats: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

export const getMessages = async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;
  const otherUserId = Number(req.query.withUser);
  if (!otherUserId) return res.status(400).json({ msg: "Missing withUser" });

  try {
    const partRes = await pool.query(
      `SELECT 1 FROM events e WHERE e.id = $1 AND (e.organizer_id = $2 OR EXISTS (SELECT 1 FROM registrations r WHERE r.event_id = e.id AND r.user_id = $2)) LIMIT 1`,
      [eventId, userId]
    );
    if (partRes.rowCount === 0) return res.status(403).json({ msg: "Not allowed" });

    const result = await pool.query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.event_id = $1
         AND ((m.sender_id = $2 AND m.receiver_id = $3) OR (m.sender_id = $3 AND m.receiver_id = $2))
       ORDER BY m.created_at ASC`,
      [eventId, userId, otherUserId]
    );
    res.json({ messages: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};
