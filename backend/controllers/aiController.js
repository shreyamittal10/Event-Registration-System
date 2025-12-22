import fetch from "node-fetch";

export const generateEventDescription = async (req, res) => {
  try {
    const { title, venue, event_date, event_time, description } = req.body;

    if (!title || !venue || !event_date || !event_time) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const prompt = description
      ? `Improve and optimize the following event description to be more engaging, clear, and attractive. Add a strong call-to-action.\n\nDescription:\n${description}`
      : `Generate an engaging event description using the following details:

Event Title: ${title}
Venue: ${venue}
Date: ${event_date}
Time: ${event_time}

Make it professional, attractive, and include a call-to-action.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json({ msg: "AI generation failed", error: data });
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(500).json({ msg: "AI generation failed" });
    }

    res.json({ description: aiText });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ msg: "AI service error" });
  }
};