import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const payload = req.body;
    const SYSTEM_PASSCODE = "Professor_Agent_001";

    if (payload.system_passcode !== SYSTEM_PASSCODE) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: "تۆ ئێستا پرۆفیسۆرێکی باڵای دارایی و وەبەرهێنانیت. بە وردی داتای بازاڕ بخوێنەوە، مەترسییەکان هەڵبسەنگێنە، و بە زمانێکی ئەکادیمی و لۆژیکی بە زمانی کوردی وەڵام بدەرەوە."
        });

        const userMessage = `بەپەلە: سیگناڵی ڕیزبوونی 8 لاینی گەیشتووە.
        - دراو: ${payload.market_pair}
        - جۆری مامەڵە: ${payload.action_type}
        - نرخی ئێستا: ${payload.entry_price}
        
        ئەی پرۆفیسۆر، تکایە شیکارییەکی خێرامان پێ بدە بۆ ئەم دۆخە.`;

        const result = await model.generateContent(userMessage);
        const responseText = result.response.text();

        // ----------------------------------------------------
        // بڕگەی نوێ: ناردنی شیکارییەکە و زەنگەکە بۆ تێلیگرام
        // ----------------------------------------------------
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        
        const telegramMessage = `🚨 <b>سیگناڵی نوێ گەیشت!</b>\n\n🔹 دراو: ${payload.market_pair}\n🔹 ئاراستە: ${payload.action_type}\n🔹 نرخ: $${payload.entry_price}\n\n🧠 <b>شیکاری پرۆفیسۆر:</b>\n${responseText}`;

        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'HTML'
            })
        });

        console.log("✅ شیکارییەکە بە سەرکەوتوویی نێردرا بۆ تێلیگرام.");
        return res.status(200).json({ message: "Signal processed and sent to Telegram." });

    } catch (error) {
        console.error("❌ هەڵەیەک ڕوویدا لە کاتی پرۆسێسکردندا:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
