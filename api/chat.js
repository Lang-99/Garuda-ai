export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { message } = req.body;
    const API_KEY = process.env.GROQ_API_KEY; // Ini ambil dari Vercel Environment Variables

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: "llama3-70b-8192", // Model pilihan kamu
                messages: [{ role: "user", content: message }],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0].message.content) {
            return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            return res.status(500).json({ error: "Gagal memproses jawaban dari AI" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
