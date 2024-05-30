const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCartItems,
  removeCartItem,
} = require("../controller/CartController");

router.use(express.json());

router.post("/", addToCart);
router.get("/", getCartItems);
router.delete("/:id", removeCartItem);

module.exports = router;
