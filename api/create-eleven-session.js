export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      // ---- MANUAL BODY PARSE (CRITICAL FIX) ----
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const bodyString = Buffer.concat(buffers).toString();
      const body = JSON.parse(bodyString || "{}");
  
      const agentId = body.agentId;
      const clientId = body.clientId;
  
      console.log("AGENT ID RECEIVED:", agentId);
  
      if (!agentId) {
        return res.status(400).json({ error: "Missing agentId" });
      }
  
      const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
      if (!ELEVEN_API_KEY) {
        return res.status(500).json({ error: "Missing ELEVENLABS_API_KEY env" });
      }
  
      const elevenRes = await fetch(
        "https://api.elevenlabs.io/v1/convai/session/create",
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVEN_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: agentId,
            client_id: clientId || crypto.randomUUID(),
          }),
        }
      );
  
      const data = await elevenRes.json();
  
      if (!elevenRes.ok) {
        console.error("ElevenLabs ERROR:", data);
        return res.status(500).json({ error: data });
      }
  
      return res.status(200).json({
        websocket_url: data.websocket_url,
      });
  
    } catch (err) {
      console.error("Server error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }