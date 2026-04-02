const express = require("express");
const { postTrack, getHistory, getStatus } = require("../controllers/trackController");

const router = express.Router();

router.post("/", postTrack);
router.get("/:deviceId/history", getHistory);
router.get("/:deviceId/status", getStatus);

module.exports = router;
