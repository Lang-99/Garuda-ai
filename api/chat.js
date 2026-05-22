export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { messages } = req.body;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: messages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            })
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error?.message || "Gagal dari API Gemini");

        return res.status(200).json({
            choices: [{ message: { content: data.candidates[0].content.parts[0].text } }]
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
