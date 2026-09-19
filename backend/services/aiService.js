const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const analyzeWithAI = async (content, language = "en") => {

    const prompt = `
You are AccessBridge AI, an accessibility assistant.

Your job is to make difficult digital information easier for people to understand and act on.

Analyze the following content and return:

1. A very simple explanation that a person with limited digital literacy can understand.
2. Clear step-by-step instructions in the correct order.
3. A list of required documents or information.
4. Important points including deadlines, dates, amounts, warnings, eligibility conditions, or restrictions.
5. Accessibility tips that help users with visual, hearing, cognitive, mobility, or digital-literacy difficulties.

Rules:
- Do not invent information that is not present in the content.
- Use short, clear sentences.
- Avoid unnecessary technical or legal language.
- Explain difficult terms in simple words when needed.
- Preserve important names, dates, amounts, requirements and conditions.
- Never change dates, times, numbers or deadlines.
- If something is not mentioned, return an empty list instead of guessing.
- Return all generated text in the requested language.
- Keep official names and document names clear and accurate.
- Return ONLY valid JSON.

Requested language: ${language}

Language rules:
- "en" means English.
- "te" means Telugu.
- "hi" means Hindi.
- Return ALL generated text in the requested language.
- Keep names, official terms, dates, numbers and document names clear and accurate.
- Do not translate names or official document names if translation could cause confusion.

Content:
${content}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    simpleExplanation: {
                        type: "string"
                    },
                    steps: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    },
                    requirements: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    },
                    importantPoints: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    },
                    accessibilityTips: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                },
                required: [
                    "simpleExplanation",
                    "steps",
                    "requirements",
                    "importantPoints",
                    "accessibilityTips"
                ]
            }
        }
    });

    return JSON.parse(response.text);
};

module.exports = {
    analyzeWithAI
};