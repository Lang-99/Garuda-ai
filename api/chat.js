export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method ini tidak didukung.' });
    }

    const { message, memory } = req.body;
    const API_KEY = process.env.GROQ_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'Environment Variable (GROQ_API_KEY) belum dikonfigurasi di Vercel.' });
    }

    // Memetakan struktur memori agar aman dikonsumsi oleh endpoint chat completions
    const contextHistory = Array.isArray(memory) ? memory.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
    })) : [];

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: "Anda adalah Garuda AI (Core System v2.4), sebuah sistem kecerdasan buatan analitis berestetika minimalis. Sifat Anda: sangat cerdas, dingin, berwibawa, suportif, langsung menjawab ke inti masalah, dan menghindari penjelasan bertele-tele yang tidak esensial. Gunakan format markdown yang bersih jika menyajikan data atau kode pemrograman." 
                    },
                    ...contextHistory,
                    { role: "user", content: message }
                ],
                temperature: 0.5,
                max_tokens: 1500,
                top_p: 0.9
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0].message?.content) {
            return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            const errorMessage = data.error?.message || "Gagal memproses data kognitif.";
            return res.status(500).json({ error: errorMessage });
        }
    } catch (err) {
        return res.status(500).json({ error: `Internal Core Error: ${err.message}` });
    }
}
