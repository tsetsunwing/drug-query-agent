const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    console.error("錯誤：只允許 POST 請求");
    return res.status(405).json({ error: "只允許 POST 請求" });
  }

  const { query } = req.body;
  if (!query) {
    console.error("錯誤：無查詢內容");
    return res.status(400).json({ error: "請輸入查詢內容" });
  }

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "你是一個藥物查詢助手，專為醫護人員設計。請以簡潔、專業的繁體中文回應查詢，確保資訊準確並符合醫療標準。用 Markdown 格式（例如粗體、列表）回應。",
          },
          {
            role: "user",
            content: query,
          },
        ],
        model: "grok-3-latest",
        stream: false,
        max_tokens: 100,
        temperature: 0,
      }),
      timeout: 10000, // 10 秒 timeout
    });

    if (!response.ok) {
