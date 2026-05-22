export default async function handler(req, res) {
    const { message, memory } = req.body;
    const API_KEY = process.env.GROQ_API_KEY;

    // Gabungkan memori dengan pesan baru
    const messages = [...(memory || []), { role: "user", content: message }];

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Kamu adalah Garuda AI, asisten pribadi yang minimalis, cerdas, dan suportif. Gunakan gaya bahasa yang santai namun berwibawa." },
                    ...messages
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        res.status(200).json({ reply: data.choices[0].message.content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
