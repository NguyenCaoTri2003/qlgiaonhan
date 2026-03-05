const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/order.controller");
const upload = require("../middleware/upload");

router.get("/", ordersController.getAllOrders);
router.post("/", upload.array("files"), ordersController.createOrder);

router.get("/:id", ordersController.getOrderDetail);

router.post("/:id/reject", ordersController.rejectOrder);
router.post("/:id/complete", ordersController.completeOrder);
router.post("/:id/finalize", ordersController.adminFinalize);
router.delete("/:id", ordersController.deleteOrder);

router.post("/:id/assign", ordersController.assignReceiver);
router.post("/:id/accept", ordersController.shipperAccept);

router.put("/:id", upload.array("files"), ordersController.updateOrder);
router.post("/sort", ordersController.updateOrderSort);
router.post("/update-sort", ordersController.updateOrderSort);

router.post("/:id/request-supplement", ordersController.qlRequestSupplement);
router.post("/:id/resolve", ordersController.resolveRequest);
router.post("/:id/shipper-reject", ordersController.shipperReject);
router.post("/:id/shipper-complete", ordersController.shipperComplete);
router.post("/:id/shipper-return-supplement", ordersController.shipperReturnSupplement);

module.exports = router;