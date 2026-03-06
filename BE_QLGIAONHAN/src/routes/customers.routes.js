const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customers.controller");

// router.get("/", customersController.getCustomers);
// router.get("/phone/:phone", customersController.getCustomerByPhone);
// router.get("/company/:company", customersController.getCustomerByCompany);
// router.post("/", customersController.createCustomer);
// router.put("/:id", customersController.updateCustomer);
// router.delete("/:id", customersController.deleteCustomer);
router.post("/search-customers-nhigia", customersController.searchNhigiaCompanies);

module.exports = router;