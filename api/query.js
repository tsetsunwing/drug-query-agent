export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "只允許 POST 請求" });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "請輸入查詢內容" });
  }

  try {
    const fetch = (await import("node-fetch")).default;
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
            content: "你是一個藥物查詢助手，專為醫護人員設計。請以簡潔、專業的繁體中文回應查詢，確保資訊準確並符合醫療標準。",
          },
          {
            role: "user",
            content: query,
          },
        ],
        model: "grok-3-latest",
        stream: false,
        max_tokens: 200,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`xAI API 出錯：狀態碼 ${response.status}, 訊息：${errorText}`);
      return res.status(500).json({ error: `API 請求失敗：${response.status} ${errorText}` });
    }

    const data = await response.json();
    console.log("xAI API 回應：", JSON.stringify(data, null, 2));

    let answer = "";
    if (data.choices && Array.isArray(data.choices) && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      answer = data.choices[0].message.content.trim();
    } else if (data.text) {
      answer = data.text.trim();
    } else if (data.message) {
      answer = data.message.trim();
    } else if (data.response) {
      answer = data.response.trim();
    } else if (data.answer) {
      answer = data.answer.trim();
    } else if (typeof data === "string") {
      answer = data.trim();
    } else {
      console.error("搵唔到有效答案：", data);
      answer = "未收到有效回應，請稍後再試。";
    }

    res.status(200).json({ response: answer });
  } catch (error) {
    console.error("程式出錯：", error.message);
    res.status(500).json({ error: `無法獲取回應：${error.message}` });
  }
}
