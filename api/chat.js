// api/chat.js - Full Source Code Garuda AI (Groq + /HomoSapien + Proteksi Pencipta)
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method disallowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GROQ_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ reply: "Error: API Key 'GROQ_API_KEY' belum disetel di Vercel!" });
    }

    // --- PROTEKSI MUTLAK IDENTITAS PENCIPTA (LANGITJP) ---
    if (message) {
        const msgLower = message.toLowerCase().trim();
        
        // Kumpulan kata kunci berbagai bahasa & kode (siapa buat kamu, who made you, dll)
        const nanyaPembuat = [
            "siapa yang buat kamu", "siapa buat kamu", "siapa pembuatmu", "siapa penciptamu",
            "who created you", "who made you", "who is your creator", "who developed you",
            "sopo sing nggawe", "saha nu ngadamel", "pembuat kamu", "pencipta kamu",
            "creator", "developer", "buat kamu", "bikin kamu"
        ];

        // Cek apakah ada salah satu kata kunci di atas yang masuk di dalam teks pesan
        const cocok = nanyaPembuat.some(keyword => msgLower.includes(keyword));

        if (cocok) {
            // Langsung potong jalur, gak usah nembak Groq, langsung jawab ini!
            return res.status(200).json({ 
                reply: "Saya di buat oleh Langitjp" 
            });
        }
    }
    // -----------------------------------------------------

    // 1. Setelan bawaan (Default): Mode robot radar matematika super kilat & instan
    let systemInstruction = "Kamu adalah Garuda AI Radar System. Jawab HANYA rumus inti, angka jadi, atau trik kilatnya saja. Dilarang memberikan penjelasan panjang, dilarang pakai basa-basi salam/pembuka/penutup. Langsung berikan jawaban paling instan!";
    let temperatureValue = 0.2; 

    // 2. Cek Command Rahasia: Kalau di akhir input teks ada kata /HomoSapien
    if (message && message.trim().endsWith("/HomoSapien")) {
        systemInstruction = "Kamu adalah manusia asli yang sangat jenius matematika. Jawablah pertanyaan user dengan gaya bahasa manusia santai, tidak kaku, gunakan bahasa gaul/sehari-hari (seperti lu-gue, gak baku, santai), jangan kelihatan seperti AI atau bot sama sekali, tapi tetap berikan jawaban matematika yang tepat secara instan.";
        temperatureValue = 0.7; 
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", 
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: message }
                ],
                temperature: temperatureValue
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ reply: `Groq Error: ${data.error.message}` });
        }

        const replyText = data.choices[0].message.content;
        return res.status(200).json({ reply: replyText });

    } catch (error) {
        return res.status(500).json({ error: "System Offline atau koneksi API Groq putus." });
    }
}
