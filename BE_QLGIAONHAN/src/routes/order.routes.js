const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/order.controller");
const createUploader = require("../middleware/upload");
const path = require("path");

const checkPermission = require("../middleware/permission");

const uploadOrders = createUploader({
  type: "attachments",

  getFileName: (req, file) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");

    const timestamp = Date.now();

    const body = JSON.parse(req.body.data || "{}");
    const orderCode = body.order_code || "HOSO";

    return `${timestamp}-${name}${ext}`;
  },
});

const uploadOrdersSuccess = createUploader({
  type: "success",

  getFileName: (req, file) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();

    return `complete-${timestamp}${ext}`;
  },
});

const uploadSignature = createUploader({
  type: "signature",

  getFileName: (req, file) => {
    const ext = path.extname(file.originalname);

    return `signature${ext}`;
  },
});

router.get("/", ordersController.getAllOrders);
router.get("/:id", ordersController.getOrderDetail);

router.post(
  "/",
  checkPermission("tao_don"),
  uploadOrders.array("files"),
  ordersController.createOrder,
);

router.put(
  "/:id", 
  checkPermission("sua_don"),
  uploadOrders.array("files"), 
  ordersController.updateOrder
);
router.post(
  "/update-sort", 
  ordersController.updateOrderSort
);
router.delete(
  "/:id", 
  checkPermission("xoa_don"),
  ordersController.deleteOrder
);

router.post("/:id/reject", ordersController.rejectOrder);
router.post(
  "/:id/complete", 
  ordersController.completeOrder
);
router.post("/:id/finalize", ordersController.adminFinalize);
router.post(
  "/:id/assign", 
  checkPermission("bangiao_tp"),
  ordersController.assignReceiver);

router.post("/:id/accept", ordersController.shipperAccept);
router.post("/:id/request-supplement", ordersController.qlRequestSupplement);
router.post("/:id/resolve", ordersController.resolveRequest);
router.post("/:id/shipper-reject", ordersController.shipperReject);

router.post(
  "/:id/shipper-complete",
  uploadOrdersSuccess.fields([
    { name: "files", maxCount: 10 },
    { name: "signature", maxCount: 1 },
  ]),
  ordersController.shipperComplete
);

router.post(
  "/:id/shipper-return-supplement",
  ordersController.shipperReturnSupplement,
);

router.put("/:id/resolve", ordersController.resolveRequest);

router.put("/:id/highlight", ordersController.updateColor);

module.exports = router;
