const express = require("express");
const { postSync, getSyncStatus } = require("../controllers/syncController");

const router = express.Router();

router.post("/", postSync);
router.get("/status/:deviceId", getSyncStatus);

module.exports = router;
