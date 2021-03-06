const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop");
const auth = require("../middleware/auth");
router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:id", shopController.getProductItem);

router.get('/cart', auth.checkLogin, shopController.getCart);

router.post("/cart",  auth.checkLogin, shopController.postCart);

router.get('/orders',  auth.checkLogin, shopController.getOrders);

router.post('/create-order',  auth.checkLogin, shopController.postOrders);

router.get('/checkout', auth.checkLogin, shopController.getCheckout);

router.get('/checkout/success', auth.checkLogin,shopController.getCheckoutSuccess);

router.get('/checkout/cancel', auth.checkLogin, shopController.getCheckout);

router.post("/cart/:productId/delete",  auth.checkLogin, shopController.deleteCart);

router.get("/orders/:orderId", auth.checkLogin, shopController.getInvoice  )
module.exports = router;
