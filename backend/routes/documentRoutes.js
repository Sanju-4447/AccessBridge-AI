const express = require("express");
const multer = require("multer");
const { analyzePDF } = require("../controllers/documentController");

const router = express.Router();

// Configure file upload
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB maximum
    },
    fileFilter: (req, file, cb) => {

        // Check PDF MIME type
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed."));
        }

        // Check file extension
        const fileName = file.originalname.toLowerCase();

        if (!fileName.endsWith(".pdf")) {
            return cb(new Error("Only .pdf files are allowed."));
        }

        cb(null, true);
    }
});

// PDF analysis route
router.post(
    "/analyze",
    upload.single("document"),
    analyzePDF
);

module.exports = router;