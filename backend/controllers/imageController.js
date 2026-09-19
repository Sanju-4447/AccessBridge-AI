const fs = require("fs");
const { analyzeImageWithAI } = require("../services/imageAIService");

const analyzeImage = async (req, res) => {
    let filePath = null;

    try {
        // Check if an image was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image."
            });
        }

        filePath = req.file.path;

        // Get requested language
        const language = req.body.language || "en";

        // Send image to Gemini
        const aiResult = await analyzeImageWithAI(
            filePath,
            req.file.mimetype,
            language
        );

        // Return result
        res.status(200).json({
            success: true,
            message: "Image analyzed successfully.",
            data: {
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                language: language,
                ...aiResult
            }
        });

    } catch (error) {
        console.error("Image Analysis Error:", error.message);

        res.status(500).json({
            success: false,
            message: "We couldn't analyze the image right now. Please try again."
        });

    } finally {
        // Delete uploaded image after processing
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

module.exports = {
    analyzeImage
};