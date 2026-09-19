const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const analyzePDFWithAI = async (filePath, language = "en") => {

    const pdfBuffer = fs.readFileSync(filePath);

    const prompt = `
You are AccessBridge AI, an accessibility assistant.

Analyze the uploaded PDF document.

The PDF may contain:
- Normal text
- Scanned pages
- Images containing text
- Forms
- Tables
- Simple diagrams

Your job is to make the information easier for people to understand and use.

Return:

1. A very simple explanation.
2. Clear step-by-step instructions.
3. Required documents or information.
4. Important dates, deadlines, amounts, warnings, eligibility conditions or restrictions.
5. Accessibility tips for people with visual, hearing, cognitive, mobility or digital-literacy difficulties.

Rules:
- Do not invent information.
- Do not change dates, numbers, amounts or deadlines.
- If information is not available, return an empty list.
- Use short and simple sentences.
- Explain difficult terms when necessary.
- If the PDF contains an image with readable text, understand and include that information.
- Return all generated text in the requested language.
- Return ONLY valid JSON.

Requested language: ${language}

Language rules:
- "en" = English
- "te" = Telugu
- "hi" = Hindi

Return this JSON structure:

{
  "simpleExplanation": "string",
  "steps": [],
  "requirements": [],
  "importantPoints": [],
  "accessibilityTips": []
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: pdfBuffer.toString("base64")
                }
            },
            {
                text: prompt
            }
        ],
        config: {
            responseMimeType: "application/json"
        }
    });

    return JSON.parse(response.text);
};

module.exports = {
    analyzePDFWithAI
};