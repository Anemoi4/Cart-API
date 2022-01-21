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
    const { cart: clientCart, item } = req.body
    
    try {
        let totalSum = 0;
        const cart  = await Cart.findOne({ cartId: clientCart.cartId})
        const {data: products} = await axios.get('http://localhost:5000/products.json')
        const product = products.find((product => {
            return product.id === item.id
        }))

        if (product === undefined) throw Error('No such item exists')

        // Check if item is in cart already
        let isInCart = cart.items.find(cartItem => {
            return cartItem.name === item.name
        })
        
        if (isInCart) {
            isInCart = { name: isInCart.name,price: isInCart.price,itemId: isInCart.itemId, quantity: isInCart.quantity }
            const updatedQuantity =  {...isInCart, quantity: isInCart.quantity + 1};
            const updatedCartItems = cart.items.filter(cartItem => {
                return cartItem.name !== isInCart.name
            })

            const updatedCart = await Cart.findOneAndUpdate({ cartId: cart.cartId }, { items: [
                ...updatedCartItems,
                updatedQuantity
            ]}, { new: true })

            // Calculate the carts total
            updatedCart.items.forEach(cartItem => {
                return totalSum += cartItem.price * cartItem.quantity
            })

            const finalCart = await Cart.findOneAndUpdate({ cartId: cart.cartId }, {totalSum}, {new: true})

            res.status(200).json({ cart: finalCart })
        } else {
            const updatedCart = await Cart.findOneAndUpdate({ cartId: cart.cartId }, { items: [
                ...cart.items,
                {
                    name: item.name,
                    price: product.price,
                    quantity: item.quantity,
                    itemId: item.id
                }
            ]
        }, { new: true })
        // Calculate the carts total
        updatedCart.items.forEach(cartItem => {
            return totalSum += cartItem.price * cartItem.quantity
        })
        const finalCart = await Cart.findOneAndUpdate({ cartId: cart.cartId }, {totalSum}, {new: true})
        res.status(200).json({ cart: finalCart })
    }



    } catch (error) {
        console.log(error)
    }
}

module.exports.removeFromCart = async (req, res) => {
    const {cart: clientCart, item} = req.body
    try {
        const cart = await Cart.findOne({ cartId: clientCart.cartId})

        let totalSum = 0;
        const filteredCart = cart.items.filter(cartItem => {
            return cartItem.name !== item.name
        })
        const updatedCart = await Cart.findOneAndUpdate( { cartId: cart.cartId }, {items: filteredCart}, {new: true})        
        updatedCart.items.forEach(cartItem => {
            return totalSum += cartItem.price * cartItem.quantity
        })
        const finalCart = await Cart.findOneAndUpdate({ cartId: cart.cartId }, {totalSum}, {new: true})
        res.status(200).json(finalCart)
    } catch (error) {
        console.log(error)
        res.status(404)
    }
}

module.exports.clearCart = async (req, res) => {
    const { cart } = req.body

    cart.items = []

    try {
        const updatedCart = await Cart.findOneAndUpdate( { cartId: cart.cartId }, {items: cart.items, totalSum: 0}, {new: true})        
        res.status(200).json(updatedCart)
        
    } catch (error) {
        console.log(error)
        res.status(400)
    }
}

module.exports.changeQuantity = async (req, res) => {
    const { cart: clientCart, item, quantity } = req.body

    try {
        let totalSum = 0;
        const cart = await Cart.findOne({ cartId: clientCart.cartId})

        let updatedQuantity = {};
        const filteredCart = cart.items.filter(cartItem => {
            return cartItem.itemId !== item.itemId
        })

        let foundItem = cart.items.find(cartItem => {
            return cartItem.itemId === item.itemId
        })

        if (foundItem) {
            foundItem = { name: foundItem.name, quantity: foundItem.quantity, itemId: foundItem.itemId, price: foundItem.price }
        }

        if(quantity.case === "sum"){
            updatedQuantity = {...foundItem, quantity: foundItem.quantity + quantity.amount }
        } else if (quantity.case === "subtraction") {
            updatedQuantity = {...foundItem, quantity: foundItem.quantity - quantity.amount }
    
            if (foundItem.quantity === 1) {
                // Remove item from the cart
                const updatedCart = await Cart.findOneAndUpdate( { cartId: cart.cartId }, {items: filteredCart}, {new: true})        
                updatedCart.items.forEach(cartItem => {
                    return totalSum += cartItem.price * cartItem.quantity
                })
                const finalCart = await Cart.findOneAndUpdate({ cartId: cart.cartId }, {totalSum}, {new: true})

                res.status(200).json(finalCart)
                return
            }
        }

        const updatedCart = await Cart.findOneAndUpdate( { cartId: cart.cartId }, {items: [
            ...filteredCart,
            updatedQuantity
        ]}, {new: true})        

        updatedCart.items.forEach(cartItem => {
            return totalSum += cartItem.price * cartItem.quantity
        })
        const finalCart = await Cart.findOneAndUpdate({ cartId: cart.cartId }, {totalSum}, {new: true})

        res.status(200).json(finalCart)
        
    } catch (error) {
        console.log(error)
        res.status(400)
    }
}