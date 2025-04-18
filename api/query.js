import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const response = await fetch("https://api.x.ai/v1/grok", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `你是一個藥物查詢助手，專為醫護人員設計。請以簡潔、專業的繁體中文回應以下查詢，確保資訊準確並符合醫療標準：${query}`,
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    res.status(200).json({ response: data.choices[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch response from xAI API" });
  }
}