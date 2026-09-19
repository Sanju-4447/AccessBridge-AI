const express = require("express");
const { analyzeContent } = require("../controllers/accessibilityController");

const router = express.Router();

router.post("/analyze", analyzeContent);

module.exports = router;