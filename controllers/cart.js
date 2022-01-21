const Cart = require('./../models/Cart')
const axios = require('axios')

module.exports.getCart = async (req, res) => {
    const { cart } = req.body

    try {
        const foundCart = await Cart.findOne({ cartId: cart.cartId})
        res.status(200).json(foundCart)
    
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

module.exports.createCart = async (req, res) => {
    try {
        const data = await Cart.create({})
        res.status(201).json({ cart: data })
    
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}
    
module.exports.addToCart = async (req, res) => {
    const { cart, item } = req.body
    
    try {
        const {data: products} = await axios.get('http://localhost:5000/products.json')
        const product = products.find((product => {
            return product.id === item.id
        }))

        if (product === undefined) throw Error('No such item exists')

        // Check if item is in cart already
        const isInCart = cart.items.find(cartItem => {
            return cartItem.name === item.name
        })

        if (isInCart) {
            const updatedQuantity =  {...isInCart, quantity: isInCart.quantity + 1};
            const updatedCartItems = cart.items.filter(cartItem => {
                return cartItem.name !== isInCart.name
            })

            const updatedCart = await Cart.findOneAndUpdate({ cartId: cart.cartId }, { items: [
                ...updatedCartItems,
                updatedQuantity
            ]}, { new: true })

            res.status(200).json({ cart: updatedCart })
        } else {
            const updatedCart = await Cart.findOneAndUpdate({ cartId: cart.cartId }, { items: [
                ...cart.items,
                {
                    name: item.name,
                    price: product.price,
                    quantity: item.quantity,
                    itemId: item.id
                }
            ]})
            console.log(updatedCart)
            res.status(200).json({ cart: updatedCart })
        }

    } catch (error) {
        console.log(error)
    }
}

module.exports.removeFromCart = async (req, res) => {
    const {cart, item} = req.body
    try {
        const filteredCart = cart.items.filter(cartItem => {
            return cartItem.name !== item.name
        })
        const updatedCart = await Cart.findOneAndUpdate( { cartId: cart.cartId }, {items: filteredCart}, {new: true})        
        res.status(200).json(updatedCart)
    } catch (error) {
        console.log(error)
        res.status(404)
    }
}

module.exports.clearCart = async (req, res) => {
    const { cart } = req.body

    cart.items = []

    try {
        const updatedCart = await Cart.findOneAndUpdate( { cartId: cart.cartId }, {items: cart.items}, {new: true})        
        res.status(200).json(updatedCart)
        
    } catch (error) {
        console.log(error)
        res.status(400)
    }
}

module.exports.changeQuantity = async (req, res) => {
    const { cart, item, quantity } = req.body

    try {
        let updatedQuantity;
        const filteredCart = cart.items.filter(cartItem => {
            return cartItem.itemId !== item.itemId
        })

        const foundItem = cart.items.find(cartItem => (cartItem.itemId === item.itemId))

        if(quantity.case === "sum"){
            updatedQuantity = {...item, quantity: foundItem.quantity + quantity.amount }
        } else if (quantity.case === "subtraction") {
            updatedQuantity = {...item, quantity: foundItem.quantity - quantity.amount }
    
            if (foundItem.quantity === 1) {
                // Remove item from the cart
                const updatedCart = await Cart.findOneAndUpdate( { cartId: cart.cartId }, {items: filteredCart}, {new: true})        
                console.log(updatedCart)
                res.status(200).json(updatedCart)
                return
            }
        }


        const updatedCart = await Cart.findOneAndUpdate( { cartId: cart.cartId }, {items: [
            ...filteredCart,
            updatedQuantity
        ]}, {new: true})        
        res.status(200).json(updatedCart)
        
    } catch (error) {
        console.log(error)
        res.status(400)
    }
}