const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require('@google/genai');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/sms', async (req, res) => {
    const incomingMessage = req.body.Body;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: incomingMessage,
        });

        const aiReply = response.text || "Sorry, I couldn't generate a response.";

        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message(aiReply);

        res.type('text/xml');
        res.send(twiml.toString());
        
    } catch (error) {
        console.error("Error generating AI response:", error);
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message("Error processing your request.");
        res.type('text/xml');
        res.send(twiml.toString());
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
