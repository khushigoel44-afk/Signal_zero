const express = require("express");
const { predictEta } = require("../controllers/predictController");

const router = express.Router();

router.post("/", predictEta);

module.exports = router;
