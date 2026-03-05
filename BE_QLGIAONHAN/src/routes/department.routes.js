const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departments.controller");

router.get("/", departmentController.getDepartment);
router.get(
  "/:departmentId/attachments",
  departmentController.getAttachmentsByDepartment,
);
router.get(
  "/:departmentId/visa-vn-type/:typeId",
  departmentController.getVisaVNTypeByDepartment,
);
// router.get("/:departmentId/visa-vn-type/:typeDetailId/details", departmentController.getVisaVNTypeDetailsByDepartment);
router.get(
  "/:departmentId/visa-vn-type/:typeId/details/:detailId",
  departmentController.getVisaVNTypeDetailsByDepartment,
);

module.exports = router;
