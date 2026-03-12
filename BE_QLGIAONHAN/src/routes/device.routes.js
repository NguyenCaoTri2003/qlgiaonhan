const router = require("express").Router();
const controller = require("../controllers/device.controller");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/save-token", verifyToken, controller.saveDeviceToken);

module.exports = router;