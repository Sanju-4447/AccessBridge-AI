const express = require("express");
const cors = require("cors");
require("dotenv").config();

const accessibilityRoutes = require("./routes/accessibilityRoutes");
const documentRoutes = require("./routes/documentRoutes");
const imageRoutes = require("./routes/imageRoutes");
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/accessibility", accessibilityRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/images", imageRoutes);
// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AccessBridge AI Backend is running!"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);

    if (err instanceof require("multer").MulterError) {

        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File is too large. Maximum PDF size is 5 MB."
            });
        }

        return res.status(400).json({
            success: false,
            message: "There was a problem uploading the file."
        });
    }

    if (err.message === "Only PDF files are allowed.") {
        return res.status(400).json({
            success: false,
            message: "Only PDF files are allowed."
        });
    }

    if (err.message === "Only .pdf files are allowed.") {
        return res.status(400).json({
            success: false,
            message: "Only .pdf files are allowed."
        });
    }
if (err.message === "Only JPG and PNG images are allowed.") {
    return res.status(400).json({
        success: false,
        message: "Only JPG and PNG images are allowed."
    });
}
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`AccessBridge AI Backend running on port ${PORT}`);
});