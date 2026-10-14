const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/sms', async (req, res) => {
    const incomingMessage = req.body.Body;
    const twiml = new twilio.twiml.MessagingResponse();

    let replyText = "";
    try {
        // Try the primary model first
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: incomingMessage,
        });
        replyText = response.text;
    } catch (primaryError) {
        console.warn("Primary model busy, trying fallback model...", primaryError);
        try {
            // Fallback model
            const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: incomingMessage,
            });
            replyText = fallbackResponse.text;
        } catch (fallbackError) {
            console.error("Error generating AI response from both models:", fallbackError);
            replyText = "Sorry, my AI models are currently experiencing high demand. Please try again in a moment!";
        }
    }

    twiml.message(replyText || "Sorry, I couldn't generate a response.");
    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
