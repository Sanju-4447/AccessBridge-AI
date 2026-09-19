const express = require("express");
const multer = require("multer");
const { analyzeImage } = require("../controllers/imageController");

const router = express.Router();

// Configure image upload
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB maximum
    },
    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPG and PNG images are allowed."));
        }

        cb(null, true);
    }
});

// Image analysis route
router.post(
    "/analyze",
    upload.single("image"),
    analyzeImage
);

module.exports = router;