const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notifications.controller");

router.get("/", notificationsController.getNotifications);
router.get("/load", notificationsController.loadNotifications);
router.post("/read-all", notificationsController.markAllAsRead);
router.put("/:id/read", notificationsController.markRead);

module.exports = router;