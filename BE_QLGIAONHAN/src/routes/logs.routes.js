const express = require("express");
const router = express.Router();
const logsController = require("../controllers/logs.controller");

router.get("/", logsController.getLogs);

module.exports = router;