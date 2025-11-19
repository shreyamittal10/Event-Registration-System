import PDFDocument from "pdfkit";
import { pool } from "../index.js";

export const downloadTicket = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    const eventRes = await pool.query(
      `SELECT title, organizer_id, event_date, event_time, venue
       FROM events WHERE id = $1`,
      [eventId]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ msg: "Event not found" });
    }

    const event = eventRes.rows[0];

    const orgRes = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [event.organizer_id]
    );

    const organizerName = orgRes.rows[0]?.name || "Organizer";

    const userRes = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [userId]
    );

    const attendeeName = userRes.rows[0]?.name || "Attendee";

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ticket_event_${eventId}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(22).text("EVENT TICKET", { align: "center" }).moveDown(2);

    doc.fontSize(16).text(`Event Name: ${event.title}`);
    doc.text(`Organizer: ${organizerName}`).moveDown(1);

    doc.text(`Attendee: ${attendeeName}`).moveDown(1);

    const formattedDate = new Date(event.event_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      
      const formattedTime = event.event_time
        ? new Date(`1970-01-01T${event.event_time}`).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "";
      
      doc.text(`Date & Time: ${formattedDate} • ${formattedTime}`);
      
    doc.text(`Location: ${event.venue}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
