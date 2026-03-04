const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");

router.get("/", controller.getUsers);
router.get("/senders", controller.getSenders);

module.exports = router;