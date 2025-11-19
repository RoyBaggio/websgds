// api/gemini-text.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: { message: "GEMINI_API_KEY belum diset di server" } });
  }

  try {
    // req.body bisa string / object → kita pastikan jadi object
    const rawBody = req.body;
    const body =
      typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody || {};

    const contents = body.contents || [];
    const modelName = body.model || "gemini-2.5-flash";

    const upstreamRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }), // kirim hanya contents
      }
    );

    const data = await upstreamRes.json();

    if (!upstreamRes.ok) {
      // teruskan error dari Gemini ke frontend
      return res.status(upstreamRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error di server gemini-text:", err);
    return res
      .status(500)
      .json({ error: { message: "Internal server error (text)" } });
  }
}
