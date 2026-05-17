const express = require("express");
const controller = require("../controllers/inventoryController");

const router = express.Router();

router.get("/", controller.getAll);
router.post("/add", controller.add);
router.post("/scan", controller.scan);
router.post("/deduct", controller.deduct);

module.exports = router;
