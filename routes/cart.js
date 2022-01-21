const { Router } = require('express')
const cartController = require('./../controllers/cart')

const router = Router()

router.post('/cart', cartController.getCart)
router.get('/cart/create', cartController.createCart)
router.put('/cart/add', cartController.addToCart)
router.put('/cart/remove', cartController.removeFromCart)
router.put('/cart/clear', cartController.clearCart)
router.put('/cart/quantity', cartController.changeQuantity)

module.exports = router