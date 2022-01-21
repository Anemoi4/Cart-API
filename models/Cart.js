const mongoose = require('mongoose') 
const crypto = require('crypto')

const cartItemSchema = mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
    itemId: String
})

const cartSchema = mongoose.Schema({
    cartId: {
        type: String,
        default: crypto.randomBytes(20).toString('hex'),
        unique: true
    },
    items: {
        type: [cartItemSchema],
        default: []
    }
})

const Cart = mongoose.model('cart', cartSchema)
module.exports = Cart