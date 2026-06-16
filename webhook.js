import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // تەنها ڕێگە بە ڕیکوێستی POST دەدەین
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const payload = req.body;
    const SYSTEM_PASSCODE = "Professor_Agent_001";

    // پشکنینی ئاسایش و وشەی نهێنی
    if (payload.system_passcode !== SYSTEM_PASSCODE) {
        console.warn("⚠️ ئاگاداری: هەوڵێکی چوونەژوورەوەی ڕێگەپێنەدراو!");
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        // هێنانە ناوەوەی کلیلی API کە لە ڕێکخستنەکانی Vercel دادەنرێت
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // جێگیرکردنی مۆدێلی Gemini 2.5 Flash
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: "تۆ ئێستا پرۆفیسۆرێکی باڵای دارایی و وەبەرهێنانیت. بە وردی داتای بازاڕ بخوێنەوە، مەترسییەکان هەڵبسەنگێنە، و بە زمانێکی ئەکادیمی و لۆژیکی وەڵام بدەرەوە."
        });

        // ئامادەکردنی پرۆمپتەکە بۆ ئەیجێنتەکە
        const userMessage = `بەپەلە: سیگناڵێکی نوێی بازاڕ گەیشتووە.
        - دراو: ${payload.market_pair}
        - تایم فرەیم: ${payload.timeframe}
        - جۆری مامەڵە: ${payload.action_type}
        - نرخی چوونە ژوورەوە: ${payload.entry_price}
        - دۆخی VWAP: ${payload.vwap_confluence}
        - کاتی ڕوودان: ${payload.current_time}
        
        ئەی پرۆفیسۆر، تکایە بەپێی ئەم داتایە و ستراتیژیی 'سێگۆشەی زێڕین'، شیکارییەکی خێرامان پێ بدە و پێمان بڵێ ئایا ئەمە کاتێکی گونجاوە بۆ چوونە ناو مامەڵە؟`;

        // ناردنی زانیارییەکان بۆ پرۆفیسۆرەکە
        const result = await model.generateContent(userMessage);
        const responseText = result.response.text();

        console.log("🧠 شیکاریی پرۆفیسۆر:\n", responseText);

        // وەڵامدانەوەی سێرڤەر بە سەرکەوتوویی
        return res.status(200).json({ 
            message: "Signal processed safely by Professor Agent.",
            analysis: responseText
        });

    } catch (error) {
        console.error("❌ هەڵەیەک ڕوویدا لە کاتی پرۆسێسکردندا:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}