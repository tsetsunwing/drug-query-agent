export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const fetch = (await import("node-fetch")).default;
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`xAI API error: Status ${response.status}, ${errorText}`);
      return res.status(500).json({ error: `API request failed: ${response.status} ${response.statusText}` });
    }

    const data = await response.json();
    console.log("xAI API response:", JSON.stringify(data, null, 2)); // Log full response

    // Try multiple response formats
    let answer = "";
    if (data.choices && Array.isArray(data.choices) && data.choices[0] && data.choices[0].text) {
      answer = data.choices[0].text.trim();
    } else if (data.text) {
      answer = data.text.trim();
    } else if (data.message) {
      answer = data.message.trim();
    } else if (data.response) {
      answer = data.response.trim();
    } else if (typeof data === "string") {
      answer = data.trim();
    } else {
      console.error("No valid response content found:", data);
      answer = "未收到有效回應，請稍後再試。";
    }

    res.status(200).json({ response: answer });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: `無法獲取回應：${error.message}` });
  }
}
