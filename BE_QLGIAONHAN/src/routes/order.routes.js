const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/order.controller");

router.get("/", ordersController.getAllOrders);
router.post("/", ordersController.createOrder);

router.post("/:id/reject", ordersController.rejectOrder);
router.post("/:id/complete", ordersController.completeOrder);
router.post("/:id/finalize", ordersController.adminFinalize);
router.delete("/:id", ordersController.deleteOrder);

router.post("/:id/assign", ordersController.assignReceiver);
router.post("/:id/accept", ordersController.shipperAccept);

router.put("/:id", ordersController.updateOrder);
router.post("/sort", ordersController.updateOrderSort);
router.post("/update-sort", ordersController.updateOrderSort);

router.post("/:id/request-supplement", ordersController.qlRequestSupplement);
router.post("/:id/resolve", ordersController.resolveRequest);
router.post("/:id/shipper-reject", ordersController.shipperReject);
router.post("/:id/shipper-complete", ordersController.shipperComplete);
router.post("/:id/shipper-return-supplement", ordersController.shipperReturnSupplement);

module.exports = router;