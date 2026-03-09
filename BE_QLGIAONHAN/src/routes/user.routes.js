const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");

router.get("/", controller.getUsers);
router.get("/senders", controller.getSenders);
router.get("/admins", controller.getAdmins);
router.get("/shippers", controller.getShippers)

module.exports = router;