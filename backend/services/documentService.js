const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
    let parser = null;

    try {
        const pdfBuffer = fs.readFileSync(filePath);

        parser = new PDFParse({
            data: pdfBuffer
        });

        const result = await parser.getText();

        const cleanedText = result.text
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

return cleanedText;

    } catch (error) {
        console.error("PDF Extraction Error:", error.message);
        throw new Error("Unable to extract text from the PDF.");

    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
};

module.exports = {
    extractTextFromPDF
};