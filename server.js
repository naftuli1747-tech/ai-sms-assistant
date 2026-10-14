const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/sms', async (req, res) => {
    const incomingMessage = req.body.Body;
    const twiml = new twilio.twiml.MessagingResponse();

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: incomingMessage,
        });

        const replyText = response.text || "Sorry, I couldn't generate a response.";
        twiml.message(replyText);
    } catch (error) {
        console.error("Error generating AI response:", error);
        twiml.message("Sorry, an error occurred while processing your request.");
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
