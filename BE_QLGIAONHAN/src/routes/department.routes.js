const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departments.controller");

router.get("/", departmentController.getDepartment);
router.get("/:departmentId/attachments", departmentController.getAttachmentsByDepartment);

module.exports = router;