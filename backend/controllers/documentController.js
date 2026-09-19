const fs = require("fs");
const { analyzePDFWithAI } = require("../services/pdfAIService");

const analyzePDF = async (req, res) => {
    let filePath = null;

    try {
        // Check if a PDF was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF file."
            });
        }

        filePath = req.file.path;

        // Get requested language
        const language = req.body.language || "en";

        // Send the complete PDF to Gemini
        const aiResult = await analyzePDFWithAI(
            filePath,
            language
        );

        // Return result
        res.status(200).json({
            success: true,
            message: "PDF analyzed successfully.",
            data: {
                fileName: req.file.originalname,
                language: language,
                ...aiResult
            }
        });

    } catch (error) {
        console.error("PDF Analysis Error:", error.message);

        res.status(500).json({
            success: false,
            message: "We couldn't analyze the PDF right now. Please try again."
        });

    } finally {
        // Delete uploaded file after processing
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

module.exports = {
    analyzePDF
};