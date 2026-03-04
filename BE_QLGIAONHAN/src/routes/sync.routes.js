const express = require("express");
const router = express.Router();
const syncController = require("../controllers/sync.controller");

router.post("/sync-orders", syncController.syncOrders);

module.exports = router;