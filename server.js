const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const cartRoutes = require('./routes/cart')

dotenv.config()

const PORT = 5000;
const DBuri = process.env.DB_URI

mongoose.connect(DBuri)
    .then(res => app.listen(PORT, () => console.log(`listening at port ${PORT}`)))
    .catch(err => console.error(err.message))

// Middleware
app.use(express.json())
app.use(cors({origin: "*"}))
app.use(express.static('public'));

// Routes

app.use(cartRoutes)