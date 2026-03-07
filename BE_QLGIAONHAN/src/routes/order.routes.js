const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/order.controller");
const createUploader = require("../middleware/upload");
const path = require("path");

const uploadOrders = createUploader({
  folder: "orders",

  getFileName: (req, file) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_");

    const now = new Date();

    const timestamp =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    const body = JSON.parse(req.body.data || "{}");

    const orderCode = body.order_code || "HOSO";

    return `${orderCode}-${timestamp}-${name}${ext}`;
  },
});

const uploadOrdersSuccess = createUploader({
  folder: "order-success",

  getFileName: (req, file) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_");

    const now = new Date();

    const timestamp =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    const body = JSON.parse(req.body.data || "{}");

    const orderCode = body.order_code || "HOSO";

    return `${orderCode}-${timestamp}-${name}${ext}`;
  },
});

router.get("/", ordersController.getAllOrders);
router.post(
  "/",
  uploadOrders.array("files"),
  ordersController.createOrder
);

router.get("/:id", ordersController.getOrderDetail);

router.post("/:id/reject", ordersController.rejectOrder);
router.post("/:id/complete", ordersController.completeOrder);
router.post("/:id/finalize", ordersController.adminFinalize);
router.delete("/:id", ordersController.deleteOrder);

router.post("/:id/assign", ordersController.assignReceiver);
router.post("/:id/accept", ordersController.shipperAccept);

router.put("/:id", uploadOrders.array("files"), ordersController.updateOrder);
router.post("/sort", ordersController.updateOrderSort);
router.post("/update-sort", ordersController.updateOrderSort);

router.post("/:id/request-supplement", ordersController.qlRequestSupplement);
router.post("/:id/resolve", ordersController.resolveRequest);
router.post("/:id/shipper-reject", ordersController.shipperReject);
router.post("/:id/shipper-complete", uploadOrdersSuccess.array("files"), ordersController.shipperComplete);
router.post("/:id/shipper-return-supplement", ordersController.shipperReturnSupplement);

router.put("/:id/resolve", ordersController.resolveRequest);

router.put("/:id/highlight", ordersController.updateColor);

module.exports = router;