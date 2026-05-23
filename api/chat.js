export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        let { message, memory, mode } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }

        const apiKey = process.env.GROQ_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API Key belum dikonfigurasi di Vercel." });
        }

        // --- SYSTEM PROMPT UTAMA ---
        let systemPromptContent = `Your name is Garuda AI, developed by Langitjp. Architecture: Llama-70b.`;

        // --- LOGIKA SETIAP MODE YANG TETAP DIPERTAHANKAN ---
        if (mode === 'rogaruda') {
            systemPromptContent += `\n\n[ROGARUDA MODE ACTIVATED - ROBLOX GAMING ASSISTANT]
- Tugas utamanya mendeteksi teks/soal yang dikirim otomatis dari radar tangkapan layar game Roblox (terutama game matematika, cerdas cermat, atau teka-teki).
- Berikan solusi atau kunci jawaban matematika yang super cepat, ringkas, langsung pada intinya, dan akurat agar user menang.
- Selalu awali balasan dengan: "🎯 [RoGaruda AI Detected]".`;
        } else if (mode === 'code') {
            systemPromptContent += `\n\n[MODE KODE AKTIF]: Fokus memberikan baris kode pemrograman yang bersih, efisien, terstruktur, dan disertai penjelasan singkat.`;
        } else if (mode === 'analyze') {
            systemPromptContent += `\n\n[MODE ANALISIS AKTIF]: Lakukan bedah logika secara mendalam, breakdown data secara matematis atau komparatif, dan berpikir kritis step-by-step.`;
        } else if (mode === 'translate') {
            systemPromptContent += `\n\n[MODE TERJEMAH AKTIF]: Terjemahkan teks antar bahasa dengan memperhatikan tata bahasa lokal, rima formal/informal, dan glosarium yang natural.`;
        }

        const systemPrompt = { role: "system", content: systemPromptContent };
        let messagesToSend = [systemPrompt];

        if (memory && Array.isArray(memory)) {
            messagesToSend = messagesToSend.concat(memory);
        }
        
        messagesToSend.push({ role: "user", content: message });

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messagesToSend,
                temperature: mode === 'rogaruda' ? 0.2 : 0.6, // Suhu rendah khusus rogaruda agar matematika presisi
                max_tokens: 1024
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            return res.status(500).json({ error: "Gagal memproses jawaban dari inti AI." });
        }

    } catch (error) {
        return res.status(500).json({ error: `System Error: ${error.message}` });
    }
}
