const { analyzeWithAI } = require("../services/aiService");

const analyzeContent = async (req, res) => {
    try {
        const { content, language = "en" } = req.body;

        // Validate content
        if (!content || typeof content !== "string" || content.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please provide valid content to analyze."
            });
        }

        // Limit extremely large requests
        if (content.length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Content is too long. Please provide content under 10,000 characters."
            });
        }

        // Analyze content using AI
        const aiResult = await analyzeWithAI(
            content.trim(),
            language
        );

        // Return clean response
        res.status(200).json({
            success: true,
            message: "Content analyzed successfully.",
            data: {
                originalContent: content.trim(),
                language: language,
                ...aiResult
            }
        });

    } catch (error) {
        console.error("AI Analysis Error:", error.message);

        res.status(500).json({
            success: false,
            message: "We couldn't analyze the content right now. Please try again."
        });
    }
};

module.exports = {
    analyzeContent
};